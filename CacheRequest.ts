type GetStorageOptions = {
	currentDate: Date;
    storageExpires?: number;
	storageKey?: string;
}
type putStorageOptions = {
	currentDate: Date;
	response: Response;

	storageExpires?: number;
	storageKey?: string;
	storageList?: string;
}


export type RequestOptions = RequestInit & {
    storageExpires?: number;
	storageKey?: string;
	storageList?: string;
};
export type StoredContent = {
    content: string | null;
	created?: string
    expires?: string;
}

/**
 * Seconds to keep data in localStorage cache, in seconds.
 * 5 minutes by default.
 */
const defaultStorageExpires = 3E2;

const FilterOptions = (Options : RequestOptions) => {
	const FetchOptions : RequestInit = {} as RequestInit;

	for (const Option in Options) {
		switch (Option) {
			case "method":
				FetchOptions.method = Options.method;
				break;
			case "headers":
				FetchOptions.headers = Options.headers;
				break;
			case "body":
				FetchOptions.body = Options.body;
				break;
			case "mode":
				FetchOptions.mode = Options.mode;
				break;
			case "credentials":
				FetchOptions.credentials = Options.credentials;
				break;
			case "cache":
				FetchOptions.cache = Options.cache;
				break;
			case "redirect":
				FetchOptions.redirect = Options.redirect;
				break;
			case "referrer":
				FetchOptions.referrer = Options.referrer;
				break;
			case "referrerPolicy":
				FetchOptions.referrerPolicy = Options.referrerPolicy;
				break;
			case "integrity":
				FetchOptions.integrity = Options.integrity;
				break;
			case "keepalive":
				FetchOptions.keepalive = Options.keepalive;
				break;
			case "signal":
				FetchOptions.signal = Options.signal;
				break;
			default:
				continue;
		}
	}

	return FetchOptions;
}

const GetStorageContent = (Options : GetStorageOptions) => {
    if (Options.storageKey === undefined) {
		return null;
	}

	const currentDate = Options.currentDate;
    // 5 minutes by default
    const storageExpires = Options.storageExpires ?? defaultStorageExpires;
    let StoredContent : StoredContent | null = null;
    let StoredValue : string | null = localStorage.getItem(Options.storageKey);

	if (StoredValue !== null) {
		StoredContent = JSON.parse(StoredValue) as StoredContent;

		let ExpireDate : Date;
		if (StoredContent.expires !== undefined){
			ExpireDate = new Date(StoredContent.expires);
		} else {
			ExpireDate = currentDate;
		}

		let CreatedDate : Date;
		if (StoredContent.created !== undefined){
			CreatedDate = new Date(StoredContent.created);
		} else {
			CreatedDate = currentDate;
		}
		// Making sure the cache expires in storageExpires seconds
		CreatedDate.setSeconds(CreatedDate.getSeconds() + storageExpires);

		if (ExpireDate < currentDate || CreatedDate < currentDate) {
			return null;
		}

		return StoredContent;
	}

	return null;
}
const PutStorageContent = async (Options : putStorageOptions) => {
    if (Options.storageKey === undefined) {
		return null;
	}

	const currentDate = Options.currentDate;
	const Response = Options.response;
    const storageExpires = Options.storageExpires ?? defaultStorageExpires;

	let CreatedDate : Date;
	let ExpireDate : Date;

	let HeaderValue = Response.headers.get("Last-Modified");
	if (HeaderValue === null) {
		HeaderValue = Response.headers.get("Date");
	}
	if (HeaderValue === null) {
		CreatedDate = currentDate;
	} else {
		CreatedDate = new Date(HeaderValue);
	}

	HeaderValue = Response.headers.get("Expires");
	if (HeaderValue === null) {
		ExpireDate = new Date(currentDate);
		ExpireDate.setSeconds(ExpireDate.getSeconds() + storageExpires);
	} else {
		ExpireDate = new Date(HeaderValue);
	}

    const StoredContent : StoredContent | null = {
		content: null,
		created: CreatedDate.toISOString(),
		expires: ExpireDate.toISOString()
	};

	// Not storing failed responses
	if (Response.ok) {
		StoredContent.content = await Response.text();

		localStorage.setItem(Options.storageKey, JSON.stringify(StoredContent));
	}

	return StoredContent;
}



export const JsonRequest = async <T>(input : RequestInfo | URL, init? : RequestOptions) => {
	init = init ?? {};

    const currentDate = new Date();
    const storageExpires = init.storageExpires ?? defaultStorageExpires;

	let StoredContent : StoredContent | null = GetStorageContent({
		currentDate,
		storageExpires,
		storageKey: init.storageKey
	});
    if (StoredContent !== null && StoredContent.content !== null) {
		return JSON.parse(StoredContent.content) as T;
	}

	const FetchOptions = FilterOptions(init);
	const Response = await fetch(input, FetchOptions);
	StoredContent = await PutStorageContent({
		currentDate: currentDate,
		response: Response,

		storageExpires,
		storageKey: init.storageKey,
		storageList: init.storageList
	});

	if (StoredContent !== null && StoredContent.content !== null) {
		return JSON.parse(StoredContent.content) as T;
	}
	
	return null;
};

export const TextRequest = async (input : RequestInfo | URL, init? : RequestOptions) => {
	init = init ?? {};

    const currentDate = new Date();
    const storageExpires = init.storageExpires ?? defaultStorageExpires;

	let StoredContent : StoredContent | null = GetStorageContent({
		currentDate,
		storageExpires,
		storageKey: init.storageKey
	});
    if (StoredContent !== null) {
		return StoredContent.content;
	}

	const FetchOptions = FilterOptions(init);
	const Response = await fetch(input, FetchOptions);
	StoredContent = await PutStorageContent({
		currentDate: currentDate,
		response: Response,

		storageExpires,
		storageKey: init.storageKey,
		storageList: init.storageList
	});

	return StoredContent?.content ?? null;
};