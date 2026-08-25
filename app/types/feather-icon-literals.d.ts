declare module 'feather-icon-literals' {
  export interface IconAttributes {
    width?: number | string
    height?: number | string
    [attribute: string]: number | string | undefined
  }

  /** Returns the SVG markup of the icon. */
  export type IconLiteral = (attributes?: IconAttributes) => string

  export const ExternalLink: IconLiteral
}
