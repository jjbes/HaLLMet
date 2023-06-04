import React from "react"
import ContentLoader from "react-content-loader"

export default () => (
  <ContentLoader 
    speed={2}
    width={378}
    height={32}
    viewBox="0 0 378 32"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
  >
    <rect x="2" y="0" rx="3" ry="3" width="378" height="12" /> 
    <rect x="2" y="20" rx="3" ry="3" width="378" height="12" /> 
  </ContentLoader>
)

