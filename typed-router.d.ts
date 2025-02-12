/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
// Generated by unplugin-vue-router. ‼️ DO NOT MODIFY THIS FILE ‼️
// It's recommended to commit this file.
// Make sure to add this file to your tsconfig.json file as an "includes" or "files" entry.

declare module 'vue-router/auto-routes' {
  import type {
    RouteRecordInfo,
    ParamValue,
    ParamValueOneOrMore,
    ParamValueZeroOrMore,
    ParamValueZeroOrOne,
  } from 'unplugin-vue-router/types'

  /**
   * Route name map generated by unplugin-vue-router
   */
  export interface RouteNamedMap {
    '/': RouteRecordInfo<'/', '/', Record<never, never>, Record<never, never>>,
    '/[...404]': RouteRecordInfo<'/[...404]', '/:404(.*)', { 404: ParamValue<true> }, { 404: ParamValue<false> }>,
    '/auth/confirm-password-reset': RouteRecordInfo<'/auth/confirm-password-reset', '/auth/confirm-password-reset', Record<never, never>, Record<never, never>>,
    '/auth/confirm-verification': RouteRecordInfo<'/auth/confirm-verification', '/auth/confirm-verification', Record<never, never>, Record<never, never>>,
    '/content/[id]': RouteRecordInfo<'/content/[id]', '/content/:id', { id: ParamValue<true> }, { id: ParamValue<false> }>,
    '/explore': RouteRecordInfo<'/explore', '/explore', Record<never, never>, Record<never, never>>,
    '/forgot-password': RouteRecordInfo<'/forgot-password', '/forgot-password', Record<never, never>, Record<never, never>>,
    '/login': RouteRecordInfo<'/login', '/login', Record<never, never>, Record<never, never>>,
    '/profile': RouteRecordInfo<'/profile', '/profile', Record<never, never>, Record<never, never>>,
    '/profile/about': RouteRecordInfo<'/profile/about', '/profile/about', Record<never, never>, Record<never, never>>,
    '/profile/collections/': RouteRecordInfo<'/profile/collections/', '/profile/collections', Record<never, never>, Record<never, never>>,
    '/profile/collections/[id]': RouteRecordInfo<'/profile/collections/[id]', '/profile/collections/:id', { id: ParamValue<true> }, { id: ParamValue<false> }>,
    '/register/': RouteRecordInfo<'/register/', '/register', Record<never, never>, Record<never, never>>,
    '/register/register-confirmed': RouteRecordInfo<'/register/register-confirmed', '/register/register-confirmed', Record<never, never>, Record<never, never>>,
    '/search': RouteRecordInfo<'/search', '/search', Record<never, never>, Record<never, never>>,
    '/settings': RouteRecordInfo<'/settings', '/settings', Record<never, never>, Record<never, never>>,
  }
}
