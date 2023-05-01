import React from "react"
import ContentLoader from "react-content-loader"

export default () => (
    <ContentLoader 
    speed={2}
    width={288}
    height={74}
    viewBox="0 0 288 74"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
  >
    <rect x="0" y="0" rx="3" ry="3" width="270" height="15" /> 
    <rect x="0" y="30" rx="3" ry="3" width="270" height="15" />
  </ContentLoader>
)
