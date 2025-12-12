import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    Linking,
    Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography } from '../theme';
import { ImageGallery } from '../components/ImageGallery';
import { carApi } from '../api';
import { useUserStore } from '../stores';
import type { RootStackParamList } from '../navigation/types';
import type { Car } from '../types';

type CarDetailRouteProp = RouteProp<RootStackParamList, 'CarDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const CarDetailScreen: React.FC = () => {
    const route = useRoute<CarDetailRouteProp>();
    const navigation = useNavigation<NavigationProp>();
    const { carId } = route.params;
    const { isLoggedIn } = useUserStore();

    const [car, setCar] = useState<Car | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadCarDetail();
    }, [carId]);

    const loadCarDetail = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await carApi.getCarDetail(carId);
            setCar(data);
        } catch (err: any) {
            setError(err.message || '加载失败');
        } finally {
            setLoading(false);
        }
    };

    // 联系车主
    const handleContact = () => {
        if (!isLoggedIn) {
            Alert.alert('提示', '请先登录后再联系车主', [
                { text: '取消', style: 'cancel' },
                { text: '去登录', onPress: () => navigation.navigate('Login') },
            ]);
            return;
        }

        if (car?.owner?.phone) {
            Linking.openURL(`tel:${car.owner.phone}`);
        } else {
            Alert.alert('提示', '暂无车主联系方式');
        }
    };

    // 收藏
    const handleFavorite = () => {
        if (!isLoggedIn) {
            Alert.alert('提示', '请先登录后再收藏', [
                { text: '取消', style: 'cancel' },
                { text: '去登录', onPress: () => navigation.navigate('Login') },
            ]);
            return;
        }
        // TODO: 实现收藏功能
        Alert.alert('提示', '收藏功能开发中');
    };

    // 格式化价格
    const formatPrice = (price: number) => {
        if (price >= 10000) {
            return `${(price / 10000).toFixed(2)}万`;
        }
        return `${price}元`;
    };

    // 格式化里程
    const formatMileage = (mileage: number) => {
        if (mileage >= 10000) {
            return `${(mileage / 10000).toFixed(1)}万公里`;
        }
        return `${mileage}公里`;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>加载中...</Text>
            </View>
        );
    }

    if (error || !car) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>😕</Text>
                <Text style={styles.errorText}>{error || '车辆信息不存在'}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadCarDetail}>
                    <Text style={styles.retryButtonText}>重试</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const images = car.images || [];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* 图片轮播 */}
                <ImageGallery images={images} height={280} />

                {/* 基本信息 */}
                <View style={styles.section}>
                    <Text style={styles.title}>{car.title}</Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.price}>{formatPrice(car.price)}</Text>
                        {car.originalPrice && car.originalPrice > car.price && (
                            <Text style={styles.originalPrice}>
                                新车指导价 {formatPrice(car.originalPrice)}
                            </Text>
                        )}
                    </View>

                    {/* 标签 */}
                    <View style={styles.tags}>
                        {car.year && (
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>{car.year}年</Text>
                            </View>
                        )}
                        {car.mileage !== undefined && (
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>{formatMileage(car.mileage)}</Text>
                            </View>
                        )}
                        {car.transmission && (
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>{car.transmission}</Text>
                            </View>
                        )}
                        {car.fuelType && (
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>{car.fuelType}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* 车辆配置 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>车辆配置</Text>
                    <View style={styles.configGrid}>
                        <View style={styles.configItem}>
                            <Text style={styles.configLabel}>品牌</Text>
                            <Text style={styles.configValue}>{car.brand?.name || '-'}</Text>
                        </View>
                        <View style={styles.configItem}>
                            <Text style={styles.configLabel}>车系</Text>
                            <Text style={styles.configValue}>{car.series || '-'}</Text>
                        </View>
                        <View style={styles.configItem}>
                            <Text style={styles.configLabel}>排量</Text>
                            <Text style={styles.configValue}>{car.displacement || '-'}</Text>
                        </View>
                        <View style={styles.configItem}>
                            <Text style={styles.configLabel}>颜色</Text>
                            <Text style={styles.configValue}>{car.color || '-'}</Text>
                        </View>
                        <View style={styles.configItem}>
                            <Text style={styles.configLabel}>上牌时间</Text>
                            <Text style={styles.configValue}>{car.registrationDate || '-'}</Text>
                        </View>
                        <View style={styles.configItem}>
                            <Text style={styles.configLabel}>所在地</Text>
                            <Text style={styles.configValue}>{car.location || '-'}</Text>
                        </View>
                    </View>
                </View>

                {/* 车辆亮点 */}
                {car.highlights && car.highlights.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>车辆亮点</Text>
                        <View style={styles.highlights}>
                            {car.highlights.map((highlight, index) => (
                                <View key={index} style={styles.highlightItem}>
                                    <Text style={styles.highlightIcon}>✓</Text>
                                    <Text style={styles.highlightText}>{highlight}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* 车辆描述 */}
                {car.description && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>车辆描述</Text>
                        <Text style={styles.description}>{car.description}</Text>
                    </View>
                )}

                {/* 车主信息 */}
                {car.owner && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>车主信息</Text>
                        <View style={styles.ownerInfo}>
                            <View style={styles.ownerAvatar}>
                                <Text style={styles.ownerAvatarText}>
                                    {car.owner.nickname?.charAt(0) || '车'}
                                </Text>
                            </View>
                            <View style={styles.ownerDetail}>
                                <Text style={styles.ownerName}>{car.owner.nickname || '车主'}</Text>
                                {car.owner.verified && (
                                    <View style={styles.verifiedBadge}>
                                        <Text style={styles.verifiedText}>已认证</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                )}

                {/* 底部占位 */}
                <View style={styles.bottomPlaceholder} />
            </ScrollView>

            {/* 底部操作栏 */}
            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.favoriteButton} onPress={handleFavorite}>
                    <Text style={styles.favoriteIcon}>♡</Text>
                    <Text style={styles.favoriteText}>收藏</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
                    <Text style={styles.contactButtonText}>联系车主</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    loadingText: {
        marginTop: spacing.sm,
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: spacing.xl,
    },
    errorIcon: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    errorText: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
        marginBottom: spacing.lg,
    },
    retryButton: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xl,
        backgroundColor: colors.primary,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: typography.sizes.md,
    },
    section: {
        backgroundColor: '#fff',
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    title: {
        fontSize: typography.sizes.xl,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: spacing.sm,
    },
    price: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.danger,
    },
    originalPrice: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginLeft: spacing.sm,
        textDecorationLine: 'line-through',
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    tag: {
        backgroundColor: colors.surface,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        borderRadius: 4,
    },
    tagText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    sectionTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.md,
    },
    configGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    configItem: {
        width: '50%',
        paddingVertical: spacing.sm,
    },
    configLabel: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    configValue: {
        fontSize: typography.sizes.md,
        color: colors.text,
    },
    highlights: {
        gap: spacing.sm,
    },
    highlightItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    highlightIcon: {
        fontSize: typography.sizes.md,
        color: colors.secondary,
        marginRight: spacing.sm,
    },
    highlightText: {
        fontSize: typography.sizes.md,
        color: colors.text,
    },
    description: {
        fontSize: typography.sizes.md,
        color: colors.text,
        lineHeight: 24,
    },
    ownerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ownerAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    ownerAvatarText: {
        fontSize: typography.sizes.lg,
        color: '#fff',
        fontWeight: '600',
    },
    ownerDetail: {
        flex: 1,
    },
    ownerName: {
        fontSize: typography.sizes.md,
        fontWeight: '500',
        color: colors.text,
        marginBottom: 4,
    },
    verifiedBadge: {
        backgroundColor: colors.primaryLight,
        paddingVertical: 2,
        paddingHorizontal: spacing.xs,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    verifiedText: {
        fontSize: typography.sizes.xs,
        color: colors.primary,
    },
    bottomPlaceholder: {
        height: 80,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: colors.border,
        gap: spacing.md,
    },
    favoriteButton: {
        alignItems: 'center',
        paddingHorizontal: spacing.md,
    },
    favoriteIcon: {
        fontSize: 24,
        color: colors.textSecondary,
    },
    favoriteText: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
        marginTop: 2,
    },
    contactButton: {
        flex: 1,
        paddingVertical: spacing.md,
        backgroundColor: colors.primary,
        borderRadius: 8,
        alignItems: 'center',
    },
    contactButtonText: {
        fontSize: typography.sizes.lg,
        color: '#fff',
        fontWeight: '600',
    },
});

export default CarDetailScreen;
