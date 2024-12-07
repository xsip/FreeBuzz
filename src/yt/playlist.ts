export interface Playlist {
  items: Item[]
  metadata: Metadata
}

export interface Item {
  id: string
  type: string
  thumbnail: Thumbnail
  title: string
  channelTitle: string
  shortBylineText: ShortBylineText
  length: Length
  isLive: boolean
}

export interface Thumbnail {
  thumbnails: Thumbnail2[]
}

export interface Thumbnail2 {
  url: string
  width: number
  height: number
}

export interface ShortBylineText {
  runs: Run[]
}

export interface Run {
  text: string
  navigationEndpoint: NavigationEndpoint
}

export interface NavigationEndpoint {
  clickTrackingParams: string
  commandMetadata: CommandMetadata
  browseEndpoint: BrowseEndpoint
}

export interface CommandMetadata {
  webCommandMetadata: WebCommandMetadata
}

export interface WebCommandMetadata {
  url: string
  webPageType: string
  rootVe: number
  apiUrl: string
}

export interface BrowseEndpoint {
  browseId: string
  canonicalBaseUrl: string
}

export interface Length {
  accessibility: Accessibility
  simpleText: string
}

export interface Accessibility {
  accessibilityData: AccessibilityData
}

export interface AccessibilityData {
  label: string
}

export interface Metadata {
  playlistMetadataRenderer: PlaylistMetadataRenderer
}

export interface PlaylistMetadataRenderer {
  title: string
  description: string
  androidAppindexingLink: string
  iosAppindexingLink: string
}
