# Backup-GenBidBot.ps1, phần bộ nhớ Claude: gộp ba bản (máy / repo / bản gốc) theo từng tệp, không chép đè
# (Khoa 17/11/2026: hai phiên cùng sao lưu bộ nhớ trong một buổi đã chép đè mất phần của nhau hai lần).
. (Join-Path $PSScriptRoot 'TestHelpers.ps1')

Describe 'Backup-GenBidBot.ps1: Sync-MemoryFile' {
    BeforeAll {
        Import-BotFunctions '../Backup-GenBidBot.ps1' @('Get-Sha', 'Test-InGitHistory', 'Sync-MemoryFile')   # "/" chạy được cả trên Linux (CI)
        $global:MemTD = $TestDrive
        # Một bộ ba thư mục mới cho mỗi ca; $null = không có tệp ở nơi đó.
        function global:New-Mem([string]$Case, $Local, $Repo, $Base) {
            $root = Join-Path $global:MemTD $Case
            $d = @{ L = Join-Path $root 'local'; G = Join-Path $root 'repo'; B = Join-Path $root 'base' }
            foreach ($k in 'L', 'G', 'B') { New-Item -ItemType Directory -Force $d[$k] | Out-Null }
            $w = { param($dir, $text) if ($null -ne $text) { [IO.File]::WriteAllText((Join-Path $dir 'm.md'), $text, $global:Utf8NoBom) } }
            & $w $d.L $Local; & $w $d.G $Repo; & $w $d.B $Base
            $d
        }
        function global:Read-Mem($d, [string]$k) { $p = Join-Path $d[$k] 'm.md'; if (Test-Path $p) { [IO.File]::ReadAllText($p) } else { $null } }
        function global:Run-Mem($d, [bool]$CheckOnly = $false) { Sync-MemoryFile 'm.md' $d.L $d.G $d.B '' 'bot/claude/memory/m.md' $CheckOnly }
        $global:Base3 = "dòng 1`ndòng 2`ndòng 3`ndòng 4`ndòng 5`n"
    }

    It 'máy và repo giống nhau: same, ghi bản gốc' {
        $d = New-Mem 'same' $Base3 $Base3 $null
        Assert-Eq (Run-Mem $d) 'same'
        Assert-Eq (Read-Mem $d 'B') $Base3
    }
    It 'chỉ máy sửa: push, repo và bản gốc nhận bản của máy' {
        $new = $Base3 + "dòng máy thêm`n"
        $d = New-Mem 'push' $new $Base3 $Base3
        Assert-Eq (Run-Mem $d) 'push'
        Assert-Eq (Read-Mem $d 'G') $new; Assert-Eq (Read-Mem $d 'B') $new
    }
    It 'chỉ git mới hơn (máy còn bản gốc): pull, KHÔNG chép bản cũ của máy đè lên repo' {
        $new = $Base3 + "dòng máy khác vừa đẩy`n"
        $d = New-Mem 'pull' $Base3 $new $Base3
        Assert-Eq (Run-Mem $d) 'pull'
        Assert-Eq (Read-Mem $d 'G') $new; Assert-Eq (Read-Mem $d 'L') $new; Assert-Eq (Read-Mem $d 'B') $new
    }
    It 'cả hai cùng sửa ở hai chỗ khác nhau: merge, cả hai nơi có phần của cả hai (ca 17/11)' {
        $local = "dòng 1 (máy sửa)`ndòng 2`ndòng 3`ndòng 4`ndòng 5`n"
        $repo = "dòng 1`ndòng 2`ndòng 3`ndòng 4`ndòng 5 (máy khác sửa)`n"
        $d = New-Mem 'merge' $local $repo $Base3
        Assert-Eq (Run-Mem $d) 'merge'
        $want = "dòng 1 (máy sửa)`ndòng 2`ndòng 3`ndòng 4`ndòng 5 (máy khác sửa)`n"
        Assert-Eq (Read-Mem $d 'L') $want; Assert-Eq (Read-Mem $d 'G') $want; Assert-Eq (Read-Mem $d 'B') $want
    }
    It 'cả hai cùng sửa một dòng: conflict, không ghi đè bên nào' {
        $local = "dòng 1`ndòng 2`ndòng 3 (máy)`ndòng 4`ndòng 5`n"; $repo = "dòng 1`ndòng 2`ndòng 3 (git)`ndòng 4`ndòng 5`n"
        $d = New-Mem 'conflict' $local $repo $Base3
        Assert-Eq (Run-Mem $d) 'conflict'
        Assert-Eq (Read-Mem $d 'L') $local; Assert-Eq (Read-Mem $d 'G') $repo; Assert-Eq (Read-Mem $d 'B') $Base3
    }
    It 'chưa có bản gốc, hai bên khác nhau, bản máy không có trong lịch sử git: conflict (không đoán bên nào mới)' {
        $d = New-Mem 'nobase' ($Base3 + "máy`n") ($Base3 + "git`n") $null
        Assert-Eq (Run-Mem $d) 'conflict'
        Assert-Eq (Read-Mem $d 'G') ($Base3 + "git`n")
    }
    It 'tệp mới: chỉ có trên máy thì push, chỉ có trên git (chưa có bản gốc) thì pull' {
        $d = New-Mem 'newlocal' 'mới trên máy' $null $null
        Assert-Eq (Run-Mem $d) 'push'; Assert-Eq (Read-Mem $d 'G') 'mới trên máy'
        $e = New-Mem 'newgit' $null 'mới trên git' $null
        Assert-Eq (Run-Mem $e) 'pull'; Assert-Eq (Read-Mem $e 'L') 'mới trên git'
    }
    It 'xoá: máy xoá tệp chưa ai sửa thì xoá trong repo; git xoá tệp máy chưa sửa thì xoá trên máy; một bên xoá một bên sửa là conflict' {
        $d = New-Mem 'dellocal' $null $Base3 $Base3
        Assert-Eq (Run-Mem $d) 'push'; Assert-Eq (Read-Mem $d 'G') $null
        $e = New-Mem 'delgit' $Base3 $null $Base3
        Assert-Eq (Run-Mem $e) 'pull'; Assert-Eq (Read-Mem $e 'L') $null
        $f = New-Mem 'delvsedit' $null ($Base3 + "git sửa`n") $Base3
        Assert-Eq (Run-Mem $f) 'conflict'; Assert-Eq (Read-Mem $f 'G') ($Base3 + "git sửa`n")
    }
    It '-Check: báo đúng việc sẽ làm nhưng không ghi gì' {
        $new = $Base3 + "dòng máy khác vừa đẩy`n"
        $d = New-Mem 'check' $Base3 $new $Base3
        Assert-Eq (Run-Mem $d $true) 'pull'
        Assert-Eq (Read-Mem $d 'L') $Base3; Assert-Eq (Read-Mem $d 'B') $Base3
    }
}
