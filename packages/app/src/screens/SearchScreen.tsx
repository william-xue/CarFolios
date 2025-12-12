import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography } from '../theme';
import { useCarStore } from '../stores';
import { CarCard } from '../components/CarCard';
import { FilterPanel, FilterValues } from '../components/FilterPanel';
import { RegionPicker } from '../components/RegionPicker';
import type { RootStackParamList } from '../navigation/types';
import type { Car, Region } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SearchScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { searchCars, searchResults, searchLoading, searchTotal, clearSearch } = useCarStore();

    const [keyword, setKeyword] = useState('');
    const [showFilter, setShowFilter] = useState(false);
    const [showRegionPicker, setShowRegionPicker] = useState(false);
    const [filters, setFilters] = useState<FilterValues>({});
    const [selectedRegion, setSelectedRegion] = useState<{
        province?: Region;
        city?: Region;
        district?: Region;
    }>({});
    const [page, setPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);

    // 获取地区显示文本
    const getRegionText = () => {
        if (selectedRegion.district) return selectedRegion.district.name;
        if (selectedRegion.city) return selectedRegion.city.name;
        if (selectedRegion.province) return selectedRegion.province.name;
        return '全国';
    };

    // 获取筛选标签
    const getFilterTags = () => {
        const tags: string[] = [];
        if (filters.brandName) tags.push(filters.brandName);
        if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
            if (filters.priceMin && filters.priceMax) {
                tags.push(`${filters.priceMin / 10000}-${filters.priceMax / 10000}万`);
            } else if (filters.priceMin) {
                tags.push(`${filters.priceMin / 10000}万以上`);
            } else if (filters.priceMax) {
                tags.push(`${filters.priceMax / 10000}万以下`);
            }
        }
        if (filters.mileageMin !== undefined || filters.mileageMax !== undefined) {
            if (filters.mileageMin && filters.mileageMax) {
                tags.push(`${filters.mileageMin / 10000}-${filters.mileageMax / 10000}万公里`);
            } else if (filters.mileageMin) {
                tags.push(`${filters.mileageMin / 10000}万公里以上`);
            } else if (filters.mileageMax) {
                tags.push(`${filters.mileageMax / 10000}万公里以下`);
            }
        }
        return tags;
    };

    // 执行搜索
    const doSearch = useCallback(
        async (pageNum: number = 1, isRefresh: boolean = false) => {
            const params: any = {
                page: pageNum,
                pageSize: 10,
            };

            if (keyword.trim()) params.keyword = keyword.trim();
            if (filters.brandId) params.brandId = filters.brandId;
            if (filters.priceMin !== undefined) params.priceMin = filters.priceMin;
            if (filters.priceMax !== undefined) params.priceMax = filters.priceMax;
            if (filters.mileageMin !== undefined) params.mileageMin = filters.mileageMin;
            if (filters.mileageMax !== undefined) params.mileageMax = filters.mileageMax;
            if (selectedRegion.province) params.provinceId = selectedRegion.province.id;
            if (selectedRegion.city) params.cityId = selectedRegion.city.id;
            if (selectedRegion.district) params.districtId = selectedRegion.district.id;

            await searchCars(params, isRefresh);
            setPage(pageNum);
        },
        [keyword, filters, selectedRegion, searchCars]
    );

    // 初始搜索
    useEffect(() => {
        doSearch(1, true);
        return () => clearSearch();
    }, []);

    // 下拉刷新
    const handleRefresh = async () => {
        setRefreshing(true);
        await doSearch(1, true);
        setRefreshing(false);
    };

    // 加载更多
    const handleLoadMore = () => {
        if (!searchLoading && searchResults.length < searchTotal) {
            doSearch(page + 1);
        }
    };

    // 搜索按钮点击
    const handleSearch = () => {
        doSearch(1, true);
    };

    // 应用筛选
    const handleApplyFilter = (newFilters: FilterValues) => {
        setFilters(newFilters);
        setTimeout(() => doSearch(1, true), 100);
    };

    // 选择地区
    const handleSelectRegion = (region: {
        province?: Region;
        city?: Region;
        district?: Region;
    }) => {
        setSelectedRegion(region);
        setTimeout(() => doSearch(1, true), 100);
    };

    // 清除筛选标签
    const handleClearFilter = (type: 'brand' | 'price' | 'mileage') => {
        const newFilters = { ...filters };
        if (type === 'brand') {
            delete newFilters.brandId;
            delete newFilters.brandName;
        } else if (type === 'price') {
            delete newFilters.priceMin;
            delete newFilters.priceMax;
        } else if (type === 'mileage') {
            delete newFilters.mileageMin;
            delete newFilters.mileageMax;
        }
        setFilters(newFilters);
        setTimeout(() => doSearch(1, true), 100);
    };

    // 点击车辆卡片
    const handleCarPress = (car: Car) => {
        navigation.navigate('CarDetail', { carId: car.id });
    };

    const filterTags = getFilterTags();

    const renderItem = ({ item }: { item: Car }) => (
        <View style={styles.cardWrapper}>
            <CarCard car={item} onPress={() => handleCarPress(item)} />
        </View>
    );

    const renderFooter = () => {
        if (!searchLoading) return null;
        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.footerText}>加载中...</Text>
            </View>
        );
    };

    const renderEmpty = () => {
        if (searchLoading) return null;
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyText}>暂无搜索结果</Text>
                <Text style={styles.emptySubtext}>试试其他关键词或筛选条件</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* 搜索栏 */}
            <View style={styles.searchBar}>
                <TouchableOpacity style={styles.locationButton} onPress={() => setShowRegionPicker(true)}>
                    <Text style={styles.locationIcon}>📍</Text>
                    <Text style={styles.locationText} numberOfLines={1}>
                        {getRegionText()}
                    </Text>
                    <Text style={styles.arrowIcon}>▼</Text>
                </TouchableOpacity>

                <View style={styles.searchInputWrapper}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="搜索品牌、车型..."
                        placeholderTextColor={colors.textSecondary}
                        value={keyword}
                        onChangeText={setKeyword}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    {keyword.length > 0 && (
                        <TouchableOpacity onPress={() => setKeyword('')}>
                            <Text style={styles.clearIcon}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Text style={styles.searchButtonText}>搜索</Text>
                </TouchableOpacity>
            </View>

            {/* 筛选栏 */}
            <View style={styles.filterBar}>
                <TouchableOpacity
                    style={[styles.filterButton, Object.keys(filters).length > 0 && styles.filterButtonActive]}
                    onPress={() => setShowFilter(true)}
                >
                    <Text style={styles.filterIcon}>⚙️</Text>
                    <Text style={styles.filterButtonText}>筛选</Text>
                </TouchableOpacity>

                {/* 筛选标签 */}
                {filterTags.length > 0 && (
                    <View style={styles.filterTags}>
                        {filters.brandName && (
                            <TouchableOpacity
                                style={styles.filterTag}
                                onPress={() => handleClearFilter('brand')}
                            >
                                <Text style={styles.filterTagText}>{filters.brandName}</Text>
                                <Text style={styles.filterTagClose}>✕</Text>
                            </TouchableOpacity>
                        )}
                        {(filters.priceMin !== undefined || filters.priceMax !== undefined) && (
                            <TouchableOpacity
                                style={styles.filterTag}
                                onPress={() => handleClearFilter('price')}
                            >
                                <Text style={styles.filterTagText}>
                                    {filters.priceMin && filters.priceMax
                                        ? `${filters.priceMin / 10000}-${filters.priceMax / 10000}万`
                                        : filters.priceMin
                                            ? `${filters.priceMin / 10000}万以上`
                                            : `${filters.priceMax! / 10000}万以下`}
                                </Text>
                                <Text style={styles.filterTagClose}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                <Text style={styles.resultCount}>共 {searchTotal} 辆</Text>
            </View>

            {/* 搜索结果列表 */}
            <FlatList
                data={searchResults}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.3}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
            />

            {/* 筛选面板 */}
            <FilterPanel
                visible={showFilter}
                onClose={() => setShowFilter(false)}
                onApply={handleApplyFilter}
                initialValues={filters}
            />

            {/* 地区选择器 */}
            <RegionPicker
                visible={showRegionPicker}
                onClose={() => setShowRegionPicker(false)}
                onSelect={handleSelectRegion}
                initialValue={{
                    provinceId: selectedRegion.province?.id,
                    cityId: selectedRegion.city?.id,
                    districtId: selectedRegion.district?.id,
                }}
            />
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.sm,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        gap: spacing.sm,
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        backgroundColor: colors.surface,
        borderRadius: 8,
        maxWidth: 100,
    },
    locationIcon: {
        fontSize: 14,
        marginRight: 4,
    },
    locationText: {
        fontSize: typography.sizes.sm,
        color: colors.text,
        flex: 1,
    },
    arrowIcon: {
        fontSize: 10,
        color: colors.textSecondary,
        marginLeft: 4,
    },
    searchInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 8,
        paddingHorizontal: spacing.sm,
    },
    searchIcon: {
        fontSize: 14,
        marginRight: spacing.xs,
    },
    searchInput: {
        flex: 1,
        paddingVertical: spacing.sm,
        fontSize: typography.sizes.md,
        color: colors.text,
    },
    clearIcon: {
        fontSize: 14,
        color: colors.textSecondary,
        padding: spacing.xs,
    },
    searchButton: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.primary,
        borderRadius: 8,
    },
    searchButtonText: {
        fontSize: typography.sizes.md,
        color: '#fff',
        fontWeight: '500',
    },
    filterBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.sm,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        backgroundColor: colors.surface,
        borderRadius: 6,
        marginRight: spacing.sm,
    },
    filterButtonActive: {
        backgroundColor: colors.primaryLight,
    },
    filterIcon: {
        fontSize: 14,
        marginRight: 4,
    },
    filterButtonText: {
        fontSize: typography.sizes.sm,
        color: colors.text,
    },
    filterTags: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    filterTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: spacing.sm,
        backgroundColor: colors.primaryLight,
        borderRadius: 12,
    },
    filterTagText: {
        fontSize: typography.sizes.xs,
        color: colors.primary,
    },
    filterTagClose: {
        fontSize: 10,
        color: colors.primary,
        marginLeft: 4,
    },
    resultCount: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginLeft: 'auto',
    },
    listContent: {
        padding: spacing.sm,
    },
    cardWrapper: {
        marginBottom: spacing.sm,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    footerText: {
        marginLeft: spacing.sm,
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.xxl * 2,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    emptyText: {
        fontSize: typography.sizes.lg,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    emptySubtext: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
});

export default SearchScreen;
