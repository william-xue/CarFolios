import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    FlatList,
    Dimensions,
    TouchableOpacity,
    Modal,
    StatusBar,
    SafeAreaView,
} from 'react-native';
import { colors, spacing, typography } from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImageGalleryProps {
    images: string[];
    height?: number;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
    images,
    height = 280,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showFullscreen, setShowFullscreen] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const fullscreenListRef = useRef<FlatList>(null);

    // 处理滚动结束
    const handleScrollEnd = (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / SCREEN_WIDTH);
        setCurrentIndex(index);
    };

    // 打开全屏
    const handleOpenFullscreen = (index: number) => {
        setCurrentIndex(index);
        setShowFullscreen(true);
    };

    // 关闭全屏
    const handleCloseFullscreen = () => {
        setShowFullscreen(false);
    };

    // 全屏滚动结束
    const handleFullscreenScrollEnd = (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / SCREEN_WIDTH);
        setCurrentIndex(index);
    };

    // 渲染缩略图
    const renderThumbnail = ({ item, index }: { item: string; index: number }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleOpenFullscreen(index)}
            style={[styles.thumbnailContainer, { height }]}
        >
            <Image
                source={{ uri: item }}
                style={[styles.thumbnailImage, { height }]}
                resizeMode="cover"
            />
        </TouchableOpacity>
    );

    // 渲染全屏图片
    const renderFullscreenImage = ({ item }: { item: string }) => (
        <View style={styles.fullscreenImageContainer}>
            <Image
                source={{ uri: item }}
                style={styles.fullscreenImage}
                resizeMode="contain"
            />
        </View>
    );

    if (images.length === 0) {
        return (
            <View style={[styles.placeholder, { height }]}>
                <Text style={styles.placeholderIcon}>🚗</Text>
                <Text style={styles.placeholderText}>暂无图片</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* 缩略图轮播 */}
            <FlatList
                ref={flatListRef}
                data={images}
                renderItem={renderThumbnail}
                keyExtractor={(_, index) => index.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScrollEnd}
                getItemLayout={(_, index) => ({
                    length: SCREEN_WIDTH,
                    offset: SCREEN_WIDTH * index,
                    index,
                })}
            />

            {/* 指示器 */}
            <View style={styles.indicatorContainer}>
                <View style={styles.indicatorBadge}>
                    <Text style={styles.indicatorText}>
                        {currentIndex + 1} / {images.length}
                    </Text>
                </View>
            </View>

            {/* 全屏查看 */}
            <Modal
                visible={showFullscreen}
                animationType="fade"
                transparent={false}
                onRequestClose={handleCloseFullscreen}
            >
                <StatusBar barStyle="light-content" backgroundColor="#000" />
                <SafeAreaView style={styles.fullscreenContainer}>
                    {/* 关闭按钮 */}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={handleCloseFullscreen}
                    >
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>

                    {/* 全屏图片列表 */}
                    <FlatList
                        ref={fullscreenListRef}
                        data={images}
                        renderItem={renderFullscreenImage}
                        keyExtractor={(_, index) => `fullscreen-${index}`}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={handleFullscreenScrollEnd}
                        initialScrollIndex={currentIndex}
                        getItemLayout={(_, index) => ({
                            length: SCREEN_WIDTH,
                            offset: SCREEN_WIDTH * index,
                            index,
                        })}
                    />

                    {/* 全屏指示器 */}
                    <View style={styles.fullscreenIndicator}>
                        <Text style={styles.fullscreenIndicatorText}>
                            {currentIndex + 1} / {images.length}
                        </Text>
                    </View>
                </SafeAreaView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    thumbnailContainer: {
        width: SCREEN_WIDTH,
    },
    thumbnailImage: {
        width: SCREEN_WIDTH,
    },
    placeholder: {
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderIcon: {
        fontSize: 48,
        marginBottom: spacing.sm,
    },
    placeholderText: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
    },
    indicatorContainer: {
        position: 'absolute',
        bottom: spacing.md,
        right: spacing.md,
    },
    indicatorBadge: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 12,
    },
    indicatorText: {
        color: '#fff',
        fontSize: typography.sizes.sm,
    },
    fullscreenContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    closeButton: {
        position: 'absolute',
        top: spacing.lg,
        right: spacing.lg,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 20,
    },
    fullscreenImageContainer: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullscreenImage: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.8,
    },
    fullscreenIndicator: {
        position: 'absolute',
        bottom: spacing.xxl,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    fullscreenIndicatorText: {
        color: '#fff',
        fontSize: typography.sizes.md,
    },
});

export default ImageGallery;
