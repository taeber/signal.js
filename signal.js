"use strict"

/**
 * @template T
 * @param {T} value
 * @returns {Signal<T>}
 */
function signal(value) {
  const target = new EventTarget()

  const sig = function (newValue) {
    if (newValue === undefined)
      return value

    if (value !== newValue) {
      value = newValue
      target.dispatchEvent(new CustomEvent("change"))
    }
  }

  sig.addEventListener    = target.addEventListener.bind(target)
  sig.removeEventListener = target.removeEventListener.bind(target)
  sig.dispatchEvent       = target.dispatchEvent.bind(target)

  sig.toString = function () {
    return `${value}`
  }

  return sig
}

/**
 * @template T
 * @param {Signal<T>} actual
 * @returns {ReadableSignal<T>}
 */
function readonly(actual) {
  const sig = function () {
    return actual()
  }

  sig.addEventListener    = actual.addEventListener.bind(actual)
  sig.removeEventListener = actual.removeEventListener.bind(actual)
  sig.dispatchEvent       = actual.dispatchEvent.bind(actual)
  sig.toString            = actual.toString.bind(actual)

  return sig
}

/**
 * @template T
 * @template U
 * @param {Signal<T>} base
 * @param {(val: T) => U} transform
 * @returns {ReadableSignal<U>}
 */
function computed(base, transform) {
  const sig = signal(transform(base()))
  base.addEventListener("change", function () {
    sig(transform(base()))
  })
  return readonly(sig)
}

/**
 * @template T
 * @typedef {EventTarget & {
 *   (): T,
 * }} ReadableSignal<T>
 */
/**
 * @template T
 * @typedef {ReadableSignal<T> & { (val: T): void }} Signal<T>
 */
