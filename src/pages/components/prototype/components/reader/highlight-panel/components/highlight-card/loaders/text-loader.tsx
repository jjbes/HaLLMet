import React from "react"
import ContentLoader from "react-content-loader"

export default () => (
  <ContentLoader 
    speed={2}
    width={340}
    height={70}
    viewBox="0 0 340 70"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
  >
    <rect x="2" y="0" rx="3" ry="3" width="340" height="10" /> 
    <rect x="2" y="60" rx="3" ry="3" width="340" height="10" /> 
    <rect x="2" y="20" rx="3" ry="3" width="340" height="10" /> 
    <rect x="2" y="40" rx="3" ry="3" width="340" height="10" />
  </ContentLoader>
)

