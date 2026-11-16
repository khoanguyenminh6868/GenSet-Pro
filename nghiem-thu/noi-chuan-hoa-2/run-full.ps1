param([string]$W, [string]$Out, [int]$Shards = 6)
New-Item -ItemType Directory -Force $Out | Out-Null
Set-Location 'C:\Projects\GenSet Pro'
$here = Split-Path $MyInvocation.MyCommand.Path
$procs = for ($s = 0; $s -lt $Shards; $s++) {
    Start-Process node -ArgumentList "`"$here\measure-full.mjs`"", "`"$W`"", "`"$Out`"", $s, $Shards -NoNewWindow -PassThru `
        -RedirectStandardOutput (Join-Path $Out "shard-$s.log") -RedirectStandardError (Join-Path $Out "shard-$s.err")
}
# B: the 10 saved Gợi ý results, check per flag (measure.mjs with no extra tenders).
$b = Start-Process node -ArgumentList "`"$here\measure.mjs`"", "`"$W`"", "`"$(Join-Path $Out 'check')`"", 0 -NoNewWindow -PassThru `
    -RedirectStandardOutput (Join-Path $Out 'check.log') -RedirectStandardError (Join-Path $Out 'check.err')
$procs + $b | Wait-Process
"done"
