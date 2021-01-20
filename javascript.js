var dragged;
var originalJSON;

/* events fired on the draggable target */
document.addEventListener("drag", function( event ) {

}, false);

document.addEventListener("dragstart", function( event ) {
	// store a ref. on the dragged elem
	dragged = event.target;
	// make it half transparent
	event.target.style.opacity = .8;
	// if it's a new link to be added, then there's special care to be taken
	if ( dragged.id == "catch" ) {
		let clone;
		let name = $("#newName").val();
		let link = $("#newLink").val();

		// Check "id"-s that are already taken
		let taken = []; // just ids
		document.querySelectorAll("#container .item").forEach(el => {
			if ( el.id.substr(0, 2) == "id" ) {
				let num = el.id.substr(2); // Here it's of type string...
				if ( taken.includes(num) ) {
					alert("Item of id " + num + " has more than one instance. JSON can't be generated. Good luck resolving it!");
				} else {
					taken.push(Number(num)); // ... and here it's converted to a number
				}
			}
		});
		let newid = 100; // begin numbering at 100, for no reason at all
		while ( taken.includes(newid) ) { newid++; } // Find next possible id	
		newid = "id" + newid; // Converting it to string

		// if no URL, then it's a folder
		if ( link == "" ) {
			clone = document.querySelector("#folder").content.cloneNode(true);
			clone.children[0].innerHTML = name;
			clone.children[0].id = newid;

		} else {
			clone = document.querySelector("#link").content.cloneNode(true);
			clone.children[0].innerHTML = name;
			clone.children[0].id = newid;
			clone.children[0].href = link;
		}
		event.dataTransfer.setData("text/plain", clone);
		document.querySelector("#hidden").innerHTML = "";
		document.querySelector("#hidden").appendChild(clone);
		dragged = document.querySelector("#" + newid);
	}
}, false);

document.addEventListener("dragend", function( event ) {
	// reset the transparency
	event.target.style.opacity = "";
}, false);

/* events fired on the drop targets */
document.addEventListener("dragover", function( event ) {
	// prevent default to allow drop
	event.preventDefault();
	/*const isLink = event.dataTransfer.types.includes("text/uri-list");
	if (isLink) {
	}*/
}, false);

document.addEventListener("dragenter", function( event ) {
	// highlight potential drop target when the draggable element enters it
	if ( !event.target.classList ) return;
	if ( event.target.classList.contains('item') ) {
		event.target.classList.add("over");
	}
	if ( event.target.classList.contains('column') ) {
		event.target.classList.add("over");
	}

}, false);

document.addEventListener("dragleave", function( event ) {
	// reset background of potential drop target when the draggable element leaves it
	if ( !event.target.classList ) return;
	if ( event.target.classList.contains('item') ) {
		event.target.classList.remove("over");
	}
	if ( event.target.classList.contains('column') ) {
		event.target.classList.remove("over");
	}


}, false);

document.addEventListener("drop", function( event ) {
	// prevent default action (open as link for some elements)
	event.preventDefault();

	event.target.classList.remove("over");

	if (event.target == dragged) {
		dragged = null;
		return;
	}

	// create new draggable item from drop target
	if (event.target.id == "catch") {
		let name = event.target.querySelector("#newName");
		let link = event.target.querySelector("#newLink");
		name.value = "";
		link.value = "";
		const data = event.dataTransfer.getData("text/uri-list");
		link.value = data;
		if ( dragged ) {
			name.value = dragged.innerHTML
		}
		dragged = null;
		return;
	}

	// Delete dropped item
	if (event.target.id == "delete") {
		if ( confirm(dragged.innerHTML + ' to be deleted!') ) {
			dragged.parentNode.removeChild( dragged );
		}
		dragged = null;
		let newStructure = assemble();
		let ids = [];
		newStructure.forEach(el => {
			ids.push(el.id);
		});
		document.querySelectorAll("#container .item").forEach(el => {
			if ( $.inArray(Number(el.id.substr(2)),ids) == -1 ) el.remove();
		});
		document.querySelectorAll("#container .column").forEach(el => {
			if (el.id == "col0") return;
			if ( $.inArray(Number(el.id.substr(3)),ids) == -1 ) el.remove();
		});
		return;
	}

	let valid = false; // let's see if valid drop was performed

	// move dragged elem to the selected drop target
	if ( event.target.classList.contains('item') ) {
		if (dragged.parentNode) dragged.parentNode.removeChild( dragged );
		event.target.insertAdjacentElement('beforebegin', dragged);
		valid = true;
	}

	if ( event.target.classList.contains('column') ) {
		if (dragged.parentNode) dragged.parentNode.removeChild( dragged );
		event.target.insertAdjacentElement('beforeend', dragged);
		valid = true;
	}

	// Finally if it's a new folder being dropped, instantly create and show subfolder
	if ( valid && !dragged.href ) {
		let id_num = Number(dragged.id.substr(2));
		if ( !document.getElementById("col" + id_num) ) {
			let clone = document.querySelector("#column").content.cloneNode(true);
			clone.children[0].id = "col" + id_num;
			container.appendChild(clone);
			document.querySelector("#id" + id_num).addEventListener('click', event => {
				openFolder(id_num);
			});
			openFolder(id_num);
		}
	}

	assemble();
	dragged = null;

}, false);

/* ____________________________________________________________________________
|                                                                              \
|                      Draggable inputs would behave weirdly                   |
\_____________________________________________________________________________*/
function entering(){
    document.getElementById('catch').setAttribute("draggable", "false");
}

function leaving(){
    document.getElementById('catch').setAttribute("draggable", "true");
}


/* _________________________________________________________________
|                                                                   \
|                      Handle Clicking on Folders                   |
\__________________________________________________________________*/
function closeFolder(id, animation=true) {
	let el = document.querySelector("#col" + id);
	el.querySelectorAll(".item").forEach(item => {
		document.querySelectorAll(".active").forEach(active => {
			if ( active.id.substr(3) == item.id.substr(2) ) {
				// Very nice recursion
				closeFolder(Number(active.id.substr(3)), animation);
			}
		});
	});
	if (animation) {
		$(el).slideUp();
		$(el).removeClass("active");
	} else {
		$(el).hide();
		$(el).removeClass("active");
	}
}

function openFolder(id) {
	let folder = document.querySelector("#id" + id);
	let subfolder = document.querySelector("#col" + id);
	if (!subfolder) return;
	if ( subfolder.classList.contains("active") ) {
		closeFolder(id, true);
		return;
	}
	[...folder.parentNode.children].forEach(child => {
		if ( child === folder ) return;
		let unrelatedFolder = document.querySelector("#col" + child.id.substr(2));
		if (unrelatedFolder && unrelatedFolder.classList.contains("active") ) {
			closeFolder(Number(child.id.substr(2)), false);
		}
	});
	$(subfolder).slideDown(function() {
		$("html, body").animate({ scrollTop: $(document).height() }, 1000);
	});
	$(subfolder).addClass("active");
}

/* ____________________________________________________
|                                                      \
|                      Export Button                   |
\_____________________________________________________*/
function generateExport(json) {
	let dataStr = "data:text/json;charset=utf-8,let config = `" + encodeURIComponent(JSON.stringify(json, null, '\t') + "`;");
	let dlAnchorElem = document.querySelector('#downloadAnchorElem');
	dlAnchorElem.setAttribute("href",     dataStr     );
	dlAnchorElem.setAttribute("download", "linklist.js");
}

/* __________________________________________________
|                                                    \
|                      Build Site                    |
\___________________________________________________*/
function buildSite(json) {
	// build page from json
	let container = document.querySelector("#container");
	let column = document.querySelector("#column");
	let folder = document.querySelector("#folder");
	let link = document.querySelector("#link");

	// count depth of data tree (=number of unique parents)
	let layers = [];
	json.forEach(el => {
		if (!layers.includes(el.parent)) {layers.push(el.parent)};
		if (!layers.includes(el.isFolder)) {layers.push(el.id)};
	});
 	// create columns in accordance to parents
	layers.forEach(el => {
		let clone = column.content.cloneNode(true);
		clone.children[0].id = "col" + el;
		clone.children[0].title = el;
		if (el == 0) {
			clone.children[0].classList.add("active");
		}
		container.appendChild(clone);
	});

	// fill dropzones with links and folder instances
	json.forEach(el => {
		let clone
		if ( el.isFolder ) {
			clone = folder.content.cloneNode(true);
		} else {
			clone = link.content.cloneNode(true);
		}
		clone.children[0].innerHTML = el.name;
		clone.children[0].id = "id" + el.id;
		if ( el.isFolder ) {
			//clone.children[0].classList.add("folder");
			clone.children[0].addEventListener('click', event => {
				openFolder(el.id);
			  });
		} else {
			clone.children[0].href = el.url;
		}
		container.querySelector("#col" + el.parent + ".column").appendChild(clone);
	});
}

/* __________________________________________________________
|                                                            \
|                      Assemble JSON Data                    |
\___________________________________________________________*/
function assemble() {
	// id: Number
	// parent: Number
	// url: String
	// name: String
	// isFolder: 0 or 1
	let data = [];
	let ids = [];
	let parents = [];
	document.querySelectorAll("#container .item").forEach(el => {
		let obj = {};
		obj.id = Number(el.id.substr(2));
		ids.push(obj.id);
		obj.parent = Number(el.parentNode.id.substr(3));
		parents.push(obj.parent);
		obj.url = "";
		obj.name = el.innerHTML;
		obj.isFolder = 1;
		if (el.tagName == "A") {
			obj.isFolder = 0;
			obj.url = el.href;
		};
		data.push(obj);
	});

	let done = true;
	while (true) {
		done = true;
		data.forEach(function(item, index, object) {
			if (item.parent == 0) return;
			if ( $.inArray(item.parent,ids) == -1 ) {
				object.splice(index, 1);
				done = false;
			}
		});
		if (done) break;
	}

	if ( JSON.stringify(data) == JSON.stringify(originalJSON) ) return;
	generateExport(data);
	document.querySelector('#downloadAnchorElem').classList.add("changed");

	return data;
}



/* __________________________________________________
|                                                    \
|                      Initialize                    |
\___________________________________________________*/
$( document ).ready(function() {
	
	let json = JSON.parse(config);

	originalJSON = json;

	// generate downloadable link to save changes
	generateExport(json);

	// build the website with anticipation that a new json structure changes it
	buildSite(json);

	$( "#delete" ).mousedown(function() {
		$( "#newName" ).val("");
		$( "#newLink" ).val("");
	});
	
});	

