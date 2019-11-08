window.$listApp = document.querySelector('#list-app');
window.$postApp = document.querySelector('#post-app');

String.prototype.lastChar = function() {
	return this[this.length-1];
};

const switchDisplay = (mode = "list") => {
	if ( mode === "list" ) {
		$listApp.style.display = "flex";
		$postApp.style.display = "none";
	} else if ( mode === "post" ) {
		$listApp.style.display = "none";
		$postApp.style.display = "flex";
	}
};

const createCategory = (item, level=0) => {
	if ( typeof item !== "object" ) return;

	let categoryUl = document.createElement('ul');
	categoryUl.className = "cus-list";
	categoryUl.style.marginLeft = `${level*1}rem`;
	categoryUl.style.paddingLeft = `5px`;

	let Categorys = Object.keys(item);
	Categorys.forEach(name => {
		let c = item[name];

		let li = document.createElement('li');

		let a = document.createElement('a');
		let pslash = c.href.lastChar() === "/" ? "" : "/";
		a.href = `/?c=${c.href}${pslash}`;
		a.innerText = name;
		a.className = "custom";

		li.appendChild(a);

		let subUl = createCategory(c.sub, level+1);
		if ( subUl ) {
			li.appendChild(subUl);
		}

		categoryUl.appendChild(li);
	});
	return categoryUl;
};

const searchObject = (obj, key, value) => {
	let keys = Object.keys(obj);
	let len = keys.length;

	if ( !value ) return obj;

	for ( let i=0;i<len;i++ ) {
		let k = keys[i];
		if ( k === key ) {
			if ( obj[k] == value ) {
				return obj;
			}
		}
		if ( typeof obj[k] === "object" ) {
			let rtn = searchObject(obj[k], key, value);
			if ( typeof rtn === "object" ) {
				return rtn;
			}
		}
	};
};

function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, '\\$&');
	var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

const getSubposts = (obj) => {
	let rtn = [];

	let target = obj;
	if ( typeof obj.sub === "object" ) {
		target = obj.sub; 
	}

	let keys = Object.keys(target);
	keys.forEach(k => {
		if ( typeof target[k] === "object" ) {
			rtn = rtn.concat(getSubposts(target[k]));
		}
	});

	if ( Array.isArray(obj.posts) ) {
		rtn = rtn.concat(obj.posts);
	}
	return rtn;
};

const getContent = (url, callback = () => {}) => {
	let xhr = new XMLHttpRequest();
	xhr.open('GET', url);
	xhr.responseType = 'text';
	xhr.onreadystatechange = (e) => {
		if ( xhr.readyState === 4 ) {
			if ( xhr.status === 200 ) {
				callback(xhr.responseText);
			}
		}
	};
	xhr.send(null);
};

const createPostList = (posts) => {
	let tp = posts;
	if ( location.search !== "" ) {
		// category 는 c 를 사용합니다.
		let v = getParameterByName('c'); 
		tp = searchObject(posts, 'href', v); 
	}
	let p = getSubposts(tp);

	if ( Array.isArray(p) ) {
		let postsUl = document.createElement('ul');
		postsUl.className = "collection custom";

		p.forEach(post => {
			let a = document.createElement('a');
			let pslash = post.href.lastChar() === "/" ? "" : "/";
			a.href=`/?v=${post.href}${pslash}`;
			a.className = "";

			let li = document.createElement('li');
			li.className = "collection-item avatar text-left";
			li.style.padding = "1rem";

			let img = document.createElement('img');
			img.className = "circle";
			img.src = post.cover;

			let span = document.createElement('h5');
			span.className = "blue-grey-text";
			span.innerText = post.title;

			let create = (() => {
				let m = post.href.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{2}-[0-9]{2}-[0-9]{2}/g);
				if ( m ) {
					let s = m[0].split('-');
					if ( s.length === 6 ) {
						return `${s[0]}. ${s[1]}. ${s[2]} ${s[3]}:${s[4]}:${s[5]}`;
					}
				}
			})();
			let cspan = document.createElement('span');
			cspan.innerText = create;

			let pspan = document.createElement('p');
			pspan.className = "black-text";

			getContent(post.href+'index.html', (res) => {
				let tmpDiv = document.createElement('div');
				tmpDiv.innerHTML = res;

				let content = tmpDiv.querySelector('main');
				pspan.innerText = content.innerText.replace(/\r\n/g, '').replace(/\n/g, '');
			});

			let rowDiv = document.createElement('div');
			rowDiv.className = "valign-wrapper";

			let lcolDiv = document.createElement('div');
			lcolDiv.className = "col s3";
			lcolDiv.appendChild(img);

			let rcolDiv = document.createElement('div');
			rcolDiv.className = "col s9";
			rcolDiv.appendChild(span);
			rcolDiv.appendChild(cspan);
			rcolDiv.appendChild(pspan);

			rowDiv.appendChild(lcolDiv);
			rowDiv.appendChild(rcolDiv);

			li.appendChild(rowDiv);
			a.appendChild(li);
			postsUl.appendChild(a);
		});
		return postsUl;
	}
};

const getPosts = (callback = () => {}) => {
	let xhr = new XMLHttpRequest();
	xhr.open('GET', '/posts.json');
	xhr.responseType = "json";
	xhr.onreadystatechange = (e) => {
		if ( xhr.readyState === 4 ) {
			if ( xhr.status === 200 ) {
				callback(xhr.response);
			}
		}
	};
	xhr.send(null);
};

const getConfig = (callback = () => {}) => {
	let xhr = new XMLHttpRequest();
	xhr.open('GET', '/config.json');
	xhr.responseType = "json";
	xhr.onreadystatechange = (e) => {
		if ( xhr.readyState === 4 ) {
			if ( xhr.status === 200 ) {
				callback(xhr.response);
			}
		}
	};
	xhr.send(null);
};

getConfig((config) => {
	window.config = config;

	getPosts((posts) => {
		document.querySelector('#category-nav').appendChild(createCategory(posts));
		document.querySelector('#mobile-category-nav').appendChild(createCategory(posts));

		let url = getParameterByName('v');
		if ( url ) {
			switchDisplay('post');

			let path = url.replace(/index$|index\.html$/g, '');

			let p = searchObject(posts, 'href', path);
			if ( p ) {
				let header = document.querySelector('#post-app #content-header');
				header.querySelector('#posting-title').innerText = p.title;

				let create = (() => {
					let m = path.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{2}-[0-9]{2}-[0-9]{2}/g);
					if ( m ) {
						let s = m[0].split('-');
						if ( s.length === 6 ) {
							return `${s[0]}. ${s[1]}. ${s[2]} ${s[3]}:${s[4]}:${s[5]}`;
						}
					}
				})();
				header.querySelector('#posting-date').innerText = create;
				header.querySelector('#posting-name').innerText = window.config.author;

				let realContent = document.querySelector('#real-content');
				realContent.onload = () => {
					realContent.height = realContent.contentDocument.scrollingElement.scrollHeight;
				};

				if ( url.match(/index$|index\.html$/) ) {
					// do not anyting.
				} else {
					if ( url[url.length-1] === '/' ) {
						url += "index";
					} else {
						url += "/index";
					}
				}
				realContent.src = url;
				/*
				getContent(url, (res) => {
					document.querySelector('#real-content').innerHTML = res;
				});
				*/
			}
		} else {
			switchDisplay('list');
			let postsList = createPostList(posts);
			console.log(postsList);
			if ( postsList ) {
				document.querySelector('#list-app').appendChild(postsList);
			}
		}
	});
});
