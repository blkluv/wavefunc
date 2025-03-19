/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as DiscoverImport } from './routes/discover'
import { Route as BrowseImport } from './routes/browse'
import { Route as AboutImport } from './routes/about'
import { Route as IndexImport } from './routes/index'
import { Route as StationNaddrImport } from './routes/station/$naddr'

// Create/Update Routes

const DiscoverRoute = DiscoverImport.update({
  id: '/discover',
  path: '/discover',
  getParentRoute: () => rootRoute,
} as any)

const BrowseRoute = BrowseImport.update({
  id: '/browse',
  path: '/browse',
  getParentRoute: () => rootRoute,
} as any)

const AboutRoute = AboutImport.update({
  id: '/about',
  path: '/about',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const StationNaddrRoute = StationNaddrImport.update({
  id: '/station/$naddr',
  path: '/station/$naddr',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/about': {
      id: '/about'
      path: '/about'
      fullPath: '/about'
      preLoaderRoute: typeof AboutImport
      parentRoute: typeof rootRoute
    }
    '/browse': {
      id: '/browse'
      path: '/browse'
      fullPath: '/browse'
      preLoaderRoute: typeof BrowseImport
      parentRoute: typeof rootRoute
    }
    '/discover': {
      id: '/discover'
      path: '/discover'
      fullPath: '/discover'
      preLoaderRoute: typeof DiscoverImport
      parentRoute: typeof rootRoute
    }
    '/station/$naddr': {
      id: '/station/$naddr'
      path: '/station/$naddr'
      fullPath: '/station/$naddr'
      preLoaderRoute: typeof StationNaddrImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/about': typeof AboutRoute
  '/browse': typeof BrowseRoute
  '/discover': typeof DiscoverRoute
  '/station/$naddr': typeof StationNaddrRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/about': typeof AboutRoute
  '/browse': typeof BrowseRoute
  '/discover': typeof DiscoverRoute
  '/station/$naddr': typeof StationNaddrRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/about': typeof AboutRoute
  '/browse': typeof BrowseRoute
  '/discover': typeof DiscoverRoute
  '/station/$naddr': typeof StationNaddrRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/about' | '/browse' | '/discover' | '/station/$naddr'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/about' | '/browse' | '/discover' | '/station/$naddr'
  id: '__root__' | '/' | '/about' | '/browse' | '/discover' | '/station/$naddr'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AboutRoute: typeof AboutRoute
  BrowseRoute: typeof BrowseRoute
  DiscoverRoute: typeof DiscoverRoute
  StationNaddrRoute: typeof StationNaddrRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AboutRoute: AboutRoute,
  BrowseRoute: BrowseRoute,
  DiscoverRoute: DiscoverRoute,
  StationNaddrRoute: StationNaddrRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/about",
        "/browse",
        "/discover",
        "/station/$naddr"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/about": {
      "filePath": "about.tsx"
    },
    "/browse": {
      "filePath": "browse.tsx"
    },
    "/discover": {
      "filePath": "discover.tsx"
    },
    "/station/$naddr": {
      "filePath": "station/$naddr.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
