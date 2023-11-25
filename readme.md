# CacheRequest

An easy-to-ue wrapper for [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) to use [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) as cache mechanism.



## Parameters

* All [native Fetch parameters](https://developer.mozilla.org/en-US/docs/Web/API/fetch#syntax)

* `storageExpires`: Arbibtriry cache expire time, in seconds  
*5 minutes by default*
* `storageKey`: Arbitray key used to write/read Response data to localStorage
* `storageList`: Arbitray "list of keys" in localStorage where `storageKey` must be saved



## How it works

We use the type `RequestOptions` that extends `RequestInit` (the type used for Fetch Options), adding the options listed above, to make our wrapper functions have the exact same syntax as Fetch:

```ts
TypeRequest(input : RequestInfo | URL, init? : RequestOptions) : Promise<Type|null>
```

Once a wrapper is called, the Request is made with all provided native Fetch parameters.

If the Response shows succeess (`Response.ok === true`) and a `storageKey` was provided, the Response Body is stored in localStorage as pure text, before this content is returned in the chosen data `Type`.

If the Response shows failure, nothing will be stored and the value `null` will be returned - with no error.

> There are different wrapper functions to make the code simpler and easier for maintenance.



## Avaliable Wrappers

### JsonRequest

```ts
JsonRequest<T>(input : RequestInfo | URL, init? : RequestOptions) : Promise<T | null>
```

Returns the Response Body parsed as JSON, interpreted as the provided type argument `T` for successful requests.

### TextRequest

```ts
TextRequest(input : RequestInfo | URL, init? : RequestOptions) : Promise<string | null>
```

Returns the Response Body parsed as pure text (string) for successful requests.



## Storage List

When the `storageList` option is provided in `init` argument, after a succesful request we will use it as key to save in localStorage an string array of succesful requests that sahere the same `storageList`.

With this freature, you can get a list of keys to seek in localStorage to better control the cache - like cleaning the cache of all requests made with our wrappers.



## TODO:

### Harder feats
* ArrayBuffer results
* Blob results
* FormData results