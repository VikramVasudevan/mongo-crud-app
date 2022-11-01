//const { default: Swal } = require("sweetalert2");

function setupEvents() {
    var elements = document.getElementsByClassName("submit-on-enter")
    if (elements) {
        console.log("elements = ", elements);
        for (var i = 0; i < elements.length; i++) {
            const element = elements.item(i);
            console.log("element = ", element);
            element.addEventListener("keydown", function (e) {
                console.log(e.code);
                if (e.code === "Enter") {  //checks whether the pressed key is "Enter"
                    validate(e);
                }
            });

        }
    }
    else
        alert("No elements matching submit-on-enter class");
}

function constructQueryParams() {
    var elements = document.getElementsByClassName("submit-on-enter");
    for (var i = 0; i < elements.length; i++) {

    }

}

function validate(e) {
    var text = e.target.value;
    //validation of the input...
    console.log("e= ", e);
    document.getElementById("filterForm").submit();
}

function showEditDialog(masterDataEntityName, columns, record, mode) {
    console.log(masterDataEntityName, record);
    let html = "";
    columns.forEach(key => {
        if (mode == 'add' && key == "_id") return;

        html += `<div class="form-group">`;
        html += `<small class='form-text text-muted text-secondary' style="display: inline-block; width: 100%; text-align: left;"><i class="fa fa-info-circle text-secondary"></i> ${key}</small>`
        html += `<input type="text" id="${key}" name="${key}" class="swal2-input form-control" placeholder="${key}" value="${record ? record[key] : ''}"`;
        if (mode == 'edit' && key == '_id') {
            html += " disabled=disabled"
        }

        html += ">";
        html += "</div>";
    });


    const modeMap = {
        "add": "Add Record",
        "edit": "Edit Record",
        "delete": "Delete Record",
    };

    const iconMap = {
        "add": "plus",
        "edit": "edit",
        "delete": "delete",
    };

    const verbMap = {
        "add": "post",
        "edit": "patch",
        "delete": "delete",
    };


    Swal.fire({
        title: `<strong>${modeMap[mode]}</strong>`,
        //icon: iconMap[mode],
        html: html,
        showDenyButton: mode == "edit",
        showCloseButton: true,
        showCancelButton: true,
        focusConfirm: false,
        preConfirm: () => {
            let updatedRecord = {};

            columns.forEach(key => {
                console.log("Swal.getPopup() = ", Swal.getPopup());
                console.log("key = ", key);
                let element = Swal.getPopup().querySelector('#' + key);
                if (element)
                    updatedRecord[key] = element.value;
            });

            return updatedRecord;
        },
        denyButtonText: "DELETE RECORD",
        confirmButtonText:
            '<i class="fa fa-save"></i> Save',
        confirmButtonAriaLabel: 'Save',
        cancelButtonText:
            '<i class="fa fa-cancel text-danger"></i> Cancel',
        cancelButtonAriaLabel: 'Cancel'
    }).then((result) => {
        console.log("result", result);
        const verb = result.isDenied ? "delete" : verbMap[mode];
        const payload = {
            masterDataEntityName: masterDataEntityName,
            action: "update",
            record: verb == 'delete' ? { _id: record._id } : result.value
        };

        if (result.isDenied) {
            //Delete flow
            Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    //Perform the delete action here.
                    callHttp(masterDataEntityName, verb, payload, "masterData");
                }
            })
        } else if (result.isDismissed) return;
        else {
            /*Submit result.value to an API that does the update */
            callHttp(masterDataEntityName, verb, payload, "masterData");
        }
    })
}

function callHttp(masterDataEntityName, verb, payload, entityType) {
    fetch(`/admin/${entityType}/api/${verb}/${masterDataEntityName}`, {
        method: verb.toUpperCase(),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then((response) => response.json())
        .then(res => {
            console.log("Request complete! response:", res);
            let apiResponseStatus = res.status;
            Swal.fire({
                icon: apiResponseStatus == 200 ? "success" : "error",
                timer: apiResponseStatus == 200 ? 2000 : undefined,
                title: res.message,
            }).then(res => {
                if (apiResponseStatus == 200)
                    window.location.reload();
            });

        });
}

function showBulkUploadDialog(masterDataEntityName) {
    Swal.fire({
        title: `Bulk Upload | <span class=text-warning>${masterDataEntityName}</span>`,
        input: 'file',
        inputAttributes: {
            'accept': 'text/csv',
            'aria-label': 'Upload file'
        }
    }).then(res => {
        console.log("res =", res);
        if (res.isConfirmed) {
            if (res.value) {
                //Call API to consume file.
                let formData = new FormData()
                formData.append('file', res.value);
                fetch(`/admin/masterData/api/upload/${masterDataEntityName}`, {
                    method: "POST",
                    body: formData
                }).then((res, error) => {
                    if (error) {
                        Swal.fire("Error processing file", JSON.stringify(error), "error");
                        return;
                    }
                    Swal.fire({ title: "File Upload Status", text: "Uploaded file successfully", icon: "success", timer: 2000 }).then(() => {
                        window.location.reload();
                    });
                })
            } else {
                Swal.fire("No file selected", "Please select a file to upload", "error");
            }
        }
    })
}

function getElement(data, path) {
    console.log("path", path);
    if (!path.includes("."))
        return data[path];
    else {
        let tokens = path.split(".");
        console.log("tokens = ", tokens);
        let d = JSON.parse(JSON.stringify(data));
        for (var i = 0; i < tokens.length; i++) {
            console.log("Processing token", tokens[i])
            if (d)
                d = d[tokens[i]];
        }
        return d;
    }
}

function removeRowFromTable(prmButton) {
    let tableRowElement = prmButton.parentElement.parentElement;
    console.log("prmButton = ", tableRowElement);
    tableRowElement.remove();
}

function getInputTag() {
    return `
    <div class="form-group">
        <input class="form-control">
    </div>
    `
}

function getDeleteRowButton() {
    return " <button type='button' class='btn btn-lg btn-danger' onclick='removeRowFromTable(this)'><i class='fa fa-remove'></i></button>";
}

function addRowToTable() {
    let thead = Swal.getPopup().querySelector('table > thead');
    let table = Swal.getPopup().querySelector('table > tbody');
    console.log("Table = ", table);
    // Create an empty <tr> element and add it to the 1st position of the table:
    var row = table.insertRow(0);

    // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
    thead.querySelectorAll("tr > th").forEach((column, colIndex) => {
        var cell1 = row.insertCell();
        if (colIndex == 0) {
            cell1.innerHTML = getDeleteRowButton();
        } else
            cell1.innerHTML = getInputTag();

    })

}

function onTxnAttributeChange(entityName, prmElement, prmFormElements, data, prmFilter) {
    console.log("prmElement ", prmElement);
    if (["_id", "__v", "dateModified", "dateCreated", "dateDeleted", "dateUpdated"].includes(prmElement.path)) {
        Swal.fire("Immutable Attribute", `${prmElement.path} is Immutable`, "warning");
        return;
    }
    var selectedAttribute = prmFormElements.find(element => element.absolutePath == prmElement.absolutePath);
    var elementId = selectedAttribute.absolutePath.replace(/./g, "_");
    console.log(selectedAttribute);
    let txnElementCards = document.getElementsByClassName("txn-element-card");
    for (var i = 0; i < txnElementCards.length; i++) {
        if (!txnElementCards.item(i).className.split(" ").includes(selectedAttribute.absolutePath)) {
            txnElementCards.item(i).style.display = 'None';
        } else
            txnElementCards.item(i).style.display = 'Block';
    }
    const title = `Edit Attribute <span class="text-warning">{${selectedAttribute.absolutePath}}</span>`;
    let html = "";
    const value = getElement(data, selectedAttribute.absolutePath);

    if (prmElement.type != 'Array') {
        html = `<div class="form-group">
                    <input id="${elementId}" name="${selectedAttribute.absolutePath}" class="form-control" placeholder="${selectedAttribute.absolutePath}" `;
        if (value)
            html += `value="${value}"`;
        html += "></div>";
    } else {
        let headings = "<th style='width : 100px; min-width : auto;'> #";
        let arrHeadings = [];
        prmElement.children?.forEach(child => {
            headings += "<th>" + child.path;
            arrHeadings.push(child.path);
        })
        html += "<div class='d-flex flex-row justify-content-end'> "
            + "<button type='button' class='btn btn-lg btn-primary' onclick='addRowToTable(" + JSON.stringify(arrHeadings) + ")'>"
            + "<i class='fa fa-plus'></i> "
            + "<span>&nbsp;Add</span>"
            + "</button></div>";
        html += `<table class="table table-bordered table-striped">
                    <thead class="thead-dark">
                        <tr class="bg-dark text-white">
                            ${headings}
                        </tr>
                    </thead>
                `;
        if (value) {
            html += "<tbody>";
            value.forEach((row, rowIndex) => {
                console.log("row = ", row);
                html += "<tr>";
                html += "<td>";
                html += getDeleteRowButton();
                prmElement.children?.forEach(col => {
                    html += "<td>";
                    var fieldElementId = col.path == '$' ? "some_element" : elementId + "_" + col.path + "_" + rowIndex;
                    const v = col.path.endsWith("$") ? row : row[col.path];
                    if (col.children) console.log("col.children", col.children)
                    html += `<div class="form-group">
                    <input class="form-control" id="${fieldElementId}" name="${fieldElementId}" value="${typeof v != 'undefined' ? v : ''}">
                    </div>`;
                    html += "</td>";
                })
                html += "</tr>";
            })
            html += "</tbody>";
        }
        html += "</table>"
    }

    Swal.fire({
        customClass: {
            popup: prmElement.type == 'Array' ? "swal-dialog-wide" : "swal-dialog-medium-wide"
        },
        title: title,
        html: html,
        showConfirmButton: true,
        showCancelButton: true,
        preConfirm: () => {
            let updatedRecord = {
                _id: data._id,
                //filter: prmFilter,
                newValue: {}
            };
            console.log(selectedAttribute.absolutePath, Swal.getPopup());
            if (prmElement.type != 'Array')
                updatedRecord.newValue[selectedAttribute.absolutePath] = Swal.getPopup().querySelector('#' + elementId).value;
            else {
                //Iterate children and construct the array for payload.
                let arrNewValues = [];
                let tableRows = Swal.getPopup().querySelectorAll("table > tbody > tr");
                tableRows.forEach((row, rowIndex) => {
                    let o = {};
                    prmElement.children?.forEach((col, colIndex) => {
                        //First column is for delete icon, ignore it.

                        var fieldElementId = col.path == '$' ? "some_element" : elementId + "_" + col.path + "_" + rowIndex;
                        const cell = row.querySelectorAll(`td`).item(colIndex + 1);
                        console.log("cell = ", cell);
                        const inputElement = cell.querySelector('div.form-group > input.form-control');
                        console.log("inputElement = ", inputElement);
                        o[col.path] = inputElement.value == "" ? undefined : inputElement.value;

                    })
                    if (Object.keys(o).includes("$"))
                        arrNewValues.push(Object.keys(o).map(k => o[k])[0])
                    else
                        arrNewValues.push(o);
                });
                updatedRecord.newValue[selectedAttribute.absolutePath] = arrNewValues;
            }
            return updatedRecord;
        }
    }).then(res => {
        console.log("res = ", res);
        if (res.isConfirmed) {
            console.log("Calling API ...");
            callHttp(entityName, "patch", res.value, "txData");
        }
    });
}

function paginationNext() {
    document.getElementById("_skip").value = parseInt(document.getElementById("_skip").value) + 1;
}

function paginationPrev() {
    document.getElementById("_skip").value = parseInt(document.getElementById("_skip").value) - 1;
}

function copyToClipboard(val) {
    navigator.clipboard.writeText(val);
    Swal.fire({ title: "Copied", text: "Copied to clipboard", icon: "success", timer: 2000 });
}