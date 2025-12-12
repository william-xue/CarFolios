import React from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
} from 'react-native'
import { launchImageLibrary, launchCamera, Asset } from 'react-native-image-picker'
import { theme, colors, spacing } from '../theme'

interface ImagePickerProps {
    images: string[]
    onChange: (images: string[]) => void
    maxCount?: number
}

export function ImagePicker({ images, onChange, maxCount = 9 }: ImagePickerProps) {
    const handleAddImage = () => {
        if (images.length >= maxCount) {
            Alert.alert('提示', `最多只能上传${maxCount}张图片`)
            return
        }

        Alert.alert(
            '选择图片',
            '请选择图片来源',
            [
                { text: '取消', style: 'cancel' },
                { text: '拍照', onPress: handleCamera },
                { text: '从相册选择', onPress: handleLibrary },
            ],
            { cancelable: true }
        )
    }

    const handleCamera = async () => {
        try {
            const result = await launchCamera({
                mediaType: 'photo',
                quality: 0.8,
                maxWidth: 1920,
                maxHeight: 1920,
            })

            if (result.assets && result.assets.length > 0) {
                addImages(result.assets)
            }
        } catch (error) {
            Alert.alert('错误', '拍照失败')
        }
    }

    const handleLibrary = async () => {
        const remaining = maxCount - images.length
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 0.8,
                maxWidth: 1920,
                maxHeight: 1920,
                selectionLimit: remaining,
            })

            if (result.assets && result.assets.length > 0) {
                addImages(result.assets)
            }
        } catch (error) {
            Alert.alert('错误', '选择图片失败')
        }
    }

    const addImages = (assets: Asset[]) => {
        const newImages = assets
            .filter((asset) => asset.uri)
            .map((asset) => asset.uri as string)

        const totalImages = [...images, ...newImages].slice(0, maxCount)
        onChange(totalImages)
    }

    const handleRemoveImage = (index: number) => {
        Alert.alert(
            '删除图片',
            '确定要删除这张图片吗？',
            [
                { text: '取消', style: 'cancel' },
                {
                    text: '删除',
                    style: 'destructive',
                    onPress: () => {
                        const newImages = images.filter((_, i) => i !== index)
                        onChange(newImages)
                    },
                },
            ],
            { cancelable: true }
        )
    }

    const handleSetCover = (index: number) => {
        if (index === 0) return
        const newImages = [...images]
        const [removed] = newImages.splice(index, 1)
        newImages.unshift(removed)
        onChange(newImages)
    }

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* 已选图片 */}
                {images.map((uri, index) => (
                    <View key={uri} style={styles.imageWrapper}>
                        <TouchableOpacity
                            style={styles.imageContainer}
                            onPress={() => handleSetCover(index)}
                            onLongPress={() => handleRemoveImage(index)}
                        >
                            <Image source={{ uri }} style={styles.image} />
                            {index === 0 && (
                                <View style={styles.coverBadge}>
                                    <Text style={styles.coverText}>封面</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => handleRemoveImage(index)}
                        >
                            <Text style={styles.removeText}>×</Text>
                        </TouchableOpacity>
                    </View>
                ))}

                {/* 添加按钮 */}
                {images.length < maxCount && (
                    <TouchableOpacity style={styles.addButton} onPress={handleAddImage}>
                        <Text style={styles.addIcon}>+</Text>
                        <Text style={styles.addText}>
                            {images.length}/{maxCount}
                        </Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            <Text style={styles.hint}>
                点击图片设为封面，长按删除。第一张为封面图。
            </Text>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    scrollContent: {
        paddingVertical: spacing.sm,
    },
    imageWrapper: {
        position: 'relative',
        marginRight: spacing.sm,
    },
    imageContainer: {
        width: 100,
        height: 100,
        borderRadius: theme.borderRadius.md,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    coverBadge: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingVertical: 2,
        alignItems: 'center',
    },
    coverText: {
        fontSize: theme.fontSize.xs,
        color: colors.white,
    },
    removeButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.error,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeText: {
        fontSize: 16,
        color: colors.white,
        fontWeight: 'bold',
        lineHeight: 18,
    },
    addButton: {
        width: 100,
        height: 100,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    addIcon: {
        fontSize: 32,
        color: colors.textLight,
        lineHeight: 36,
    },
    addText: {
        fontSize: theme.fontSize.xs,
        color: colors.textLight,
        marginTop: spacing.xs,
    },
    hint: {
        fontSize: theme.fontSize.xs,
        color: colors.textLight,
        marginTop: spacing.xs,
    },
})
