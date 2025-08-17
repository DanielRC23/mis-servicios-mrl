export const saveScrollPosition = (key: string) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(`scroll-${key}`, window.scrollY.toString())
  }
}

export const restoreScrollPosition = (key: string) => {
  if (typeof window !== "undefined") {
    const savedPosition = sessionStorage.getItem(`scroll-${key}`)
    if (savedPosition) {
      setTimeout(() => {
        window.scrollTo(0, Number.parseInt(savedPosition))
      }, 100)
    }
  }
}
