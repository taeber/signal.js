# signal.js

Signals implementation which utilizes `EventTarget`.

```javascript
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


// test

const s1 = signal("hey")

console.log(`s1 set to  : ${s1}`)
s1.addEventListener("change",
  () => console.log(`s1 changed : ${s1}`))

s1("you")

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

const s2 = readonly(s1)
s2.addEventListener("change", function () {
  console.log(`s2 changed : ${s2}`)
})
console.log("")
console.log(`s2 --> s1  : ${s2}`)
s2("foo")
console.log(`Calling s2("foo") had no effect => ${s2}`)

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

const c3po =
  computed(s1, val =>
    val.startsWith("beep")
      ? "Thank the Maker!"
      : `${val}... I don't understand.`)

c3po.addEventListener("change", function () {
  console.log(`c3po changed : ${c3po}`)
})

console.log("")
console.log(`c3po -> s1 : ${c3po}`)
s1("beep boop!")

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
```

