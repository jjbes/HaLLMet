import React from "react"
import ContentLoader from "react-content-loader"

export default () => (
    <ContentLoader 
    speed={2}
    width={288}
    height={80}
    viewBox="0 0 288 80"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
  >
    <rect x="2" y="0" rx="3" ry="3" width="280" height="11" /> 
    <rect x="2" y="60" rx="3" ry="3" width="280" height="11" /> 
    <rect x="2" y="20" rx="3" ry="3" width="280" height="11" /> 
    <rect x="2" y="40" rx="3" ry="3" width="280" height="11" />
  </ContentLoader>
)

