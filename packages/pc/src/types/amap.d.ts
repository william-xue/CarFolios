// 高德地图类型声明
declare global {
    interface Window {
        AMap: typeof AMap
    }
}

declare namespace AMap {
    class Map {
        constructor(container: string | HTMLElement, options?: MapOptions)
        add(overlay: Marker | Marker[]): void
        remove(overlay: Marker | Marker[]): void
        destroy(): void
        setCenter(center: [number, number]): void
        setZoom(zoom: number): void
        getCenter(): LngLat
        getZoom(): number
    }

    class Marker {
        constructor(options?: MarkerOptions)
        setPosition(position: [number, number]): void
        getPosition(): LngLat
        on(event: string, handler: Function): void
        off(event: string, handler: Function): void
    }

    class InfoWindow {
        constructor(options?: InfoWindowOptions)
        open(map: Map, position: LngLat | [number, number]): void
        close(): void
    }

    class LngLat {
        constructor(lng: number, lat: number)
        getLng(): number
        getLat(): number
    }

    class Pixel {
        constructor(x: number, y: number)
    }

    interface MapOptions {
        zoom?: number
        center?: [number, number]
        viewMode?: '2D' | '3D'
        pitch?: number
        rotation?: number
        features?: string[]
    }

    interface MarkerOptions {
        position?: [number, number]
        title?: string
        icon?: string | Icon
        offset?: Pixel
        anchor?: string
    }

    interface InfoWindowOptions {
        content?: string | HTMLElement
        offset?: Pixel
        anchor?: string
        isCustom?: boolean
    }

    interface Icon {
        size?: Size
        image?: string
        imageSize?: Size
        imageOffset?: Pixel
    }

    interface Size {
        width: number
        height: number
    }
}

export { }
