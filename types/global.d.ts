export {}
declare global {
  interface Window {
    getPrivatePhone: (val: string | number) => string
    system_config: {
      solutionTitle: string
      documentTitle: string
      solutionTab: Array<string>
      solutionDefalutTabIndex: number
    }
  }
  interface Location {
    hrefWithToken: string
  }
}
