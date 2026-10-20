import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TenderCard } from '../../components/TenderCard';
import { Button, Chip, EmptyState, ErrorBox, Input } from '../../components/ui';
import { api, ApiError } from '../../lib/api';
import { formatDateTime } from '../../lib/format';
import { useStore } from '../../lib/store';
import { colors, font, spacing } from '../../lib/theme';

type Sort = 'closing' | 'newest';
const STALE_MS = 30 * 60 * 1000;

export default function TendersScreen() {
  const { ready, feed, setFeed, tracked } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('closing');

  const load = useCallback(
    async (opts: { refresh?: boolean; sample?: boolean } = {}) => {
      setLoading(true);
      setError(undefined);
      try {
        setFeed(await api.tenders(opts));
      } catch (e) {
        setError(e instanceof ApiError ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    },
    [setFeed],
  );

  useEffect(() => {
    if (ready && (!feed || feed.source === 'sample' || Date.now() - new Date(feed.fetchedAt).getTime() > STALE_MS)) load();
    // Only on first ready; later loads are user-triggered.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const tenders = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = Date.now();
    const list = (feed?.tenders ?? []).filter(
      // Re-check closing time locally so a cached list never shows tenders that have since closed.
      (t) => (!t.bidCloseDate || new Date(t.bidCloseDate).getTime() > now) &&
        (!q || [t.bidName, t.investorName, t.notifyNo, t.location].some((v) => v?.toLowerCase().includes(q))),
    );
    return list.sort((a, b) =>
      sort === 'closing'
        ? (a.bidCloseDate ?? '9').localeCompare(b.bidCloseDate ?? '9')
        : (b.publicDate ?? '').localeCompare(a.publicDate ?? ''),
    );
  }, [feed, query, sort]);

  const header = (
    <View style={{ marginBottom: spacing(3) }}>
      <Text style={font.h1}>Gói thầu máy phát điện đang mở</Text>
      <Text style={[font.small, { marginTop: spacing(1) }]}>
        Nguồn: muasamcong.mof.gov.vn
        {feed ? ` · cập nhật ${formatDateTime(feed.fetchedAt)}` : ''}
      </Text>
      {feed?.source === 'sample' ? (
        <Text style={[font.small, { color: colors.info, marginTop: spacing(1) }]}>Đang hiển thị dữ liệu mẫu, không phải thông báo thật.</Text>
      ) : null}
      <View style={{ marginTop: spacing(3) }}>
        <Input value={query} onChangeText={setQuery} placeholder="Lọc theo tên, chủ đầu tư, số TBMT, tỉnh..." />
      </View>
      <View style={{ flexDirection: 'row', gap: spacing(2), marginTop: spacing(3), alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip label="Sắp đóng thầu" active={sort === 'closing'} onPress={() => setSort('closing')} />
        <Chip label="Mới đăng" active={sort === 'newest'} onPress={() => setSort('newest')} />
        <View style={{ flex: 1 }} />
        <Button title="Làm mới" icon="refresh" variant="outline" compact loading={loading} onPress={() => load({ refresh: true })} />
      </View>
      {error ? (
        <View style={{ marginTop: spacing(3) }}>
          <ErrorBox message={error} />
          <Button title="Xem dữ liệu mẫu" variant="ghost" compact icon="flask-outline" onPress={() => load({ sample: true })} />
        </View>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['left', 'right']}>
      <FlatList
        data={tenders}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => <TenderCard tender={item} stage={tracked[item.id]?.stage} />}
        ListHeaderComponent={header}
        ListEmptyComponent={
          loading ? undefined : (
            <EmptyState
              icon="search-outline"
              title={feed ? 'Không có gói thầu phù hợp' : 'Chưa có dữ liệu'}
              text={feed ? 'Hiện chưa có gói thầu máy phát điện nào còn mở, hoặc bộ lọc quá hẹp.' : 'Kéo xuống hoặc bấm Làm mới để tải.'}
            />
          )
        }
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => load({ refresh: true })} tintColor={colors.primary} />}
        contentContainerStyle={{ padding: spacing(4), paddingBottom: spacing(10), width: '100%', maxWidth: 860, alignSelf: 'center' }}
      />
    </SafeAreaView>
  );
}
