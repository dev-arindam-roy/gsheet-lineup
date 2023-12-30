$(document).ready(function () {

    /** SweetAlert2 loading */
    const displayLoading = (title = 'Please Wait...', text = "System Processing Your Request", timer = 10000) => {
        Swal.fire({
            title: title,
            text: text,
            allowEscapeKey: false,
            allowOutsideClick: false,
            timer: timer,
            didOpen: () => {
                Swal.showLoading()
            }
        });
    }

    /** SweetAlert2 like toast */
    const displayToast = (position = 'top-end', title = 'Its Done!') => {
        Swal.fire({
            position: position,
            icon: 'success',
            title: title,
            showConfirmButton: false,
            timer: 1000
        });
    }

    /** SweetAlert2 custom function */
    const displayAlert = (icon = 'success', title = '', text = '', confirmButtonText = 'OK') => {
        Swal.fire({
            icon: icon,
            title: title,
            text: text,
            confirmButtonColor: '#0d6efd',
            confirmButtonText: confirmButtonText
        });
    }

    const addToDoInit = () => {
        document.getElementById('submitBtn').disabled = false;
        document.getElementById('todoName').value = '';
        document.getElementById('todoName').classList.remove('is-valid');
        //$('#frmx').validate().resetForm();
    }

    const editToDoInit = () => {
        $('#todoNameEdit').val('');
        $('#todoStatusEdit').val('').trigger('change');
        $('#todoIdEdit').val('');
        $('#todoNameEdit').removeClass('is-valid').removeClass('is-invalid');
        $('#todoNameEdit-error').remove();
        $('#todoNameEdit').parent().find('.onex-form-label').removeClass('onex-error-label');
    }

    const initData = () => {
        addToDoInit();
        editToDoInit();
    }

    const uniqueTimeString = () => {
        return Date.now() + ( (Math.random()*100000).toFixed());
    }

    const openEditToDoModal = (id, name, status) => {
        $('#todoNameEdit').val(name);
        $('#todoStatusEdit').val(status).trigger('change');
        $('#todoIdEdit').val(id);
        $('#todoEditModal').modal('show');
    }

    const closeEditToDoModal = () => {
        initData();
        $('#todoEditModal').modal('hide');
    }

    const apiUrl = "https://script.google.com/macros/s/AKfycbxJjmyHwcg7czglpyb4H4x-2MFoFfm7h-77v6TUBbHl6TgWV5E4oIIacWdOgQ0i7jh-/exec";

    const getAllToDos = async () => {
        let response = await fetch(apiUrl + "?dataKey=todos");
        let responseJson = await response.json();
        let data = responseJson.data;
        return Object.values(data).reverse();
    }

    const loadToDos = async () => {
        displayLoading('Please Wait...', 'System Checking Your ToDos');
        await getAllToDos().then((data) => {
            if(data.length > 1) {
                let setHtmlPrending = '';
                let setHtmlCompleted = '';
                for(let i = 0; i < data.length; i++) {
                    if(data[i][2] == "PENDING") {
                        setHtmlPrending += `<tr>
                            <td>
                                <input type="checkbox" class="todo-ckb" value="${data[i][0]}" />
                            </td>
                            <td>${data[i][1]}</td>
                            <td>
                                <a href="javascript:void(0);" class="edit-todo" data-todoid="${data[i][0]}"><i class="far fa-edit"></i></a>
                            </td>
                        </tr>`;
                    }
                    if(data[i][2] == "COMPLETED") {
                        setHtmlCompleted += `<tr>
                            <td>
                                <input type="checkbox" class="todo-ckb" checked="checked" value="${data[i][0]}" />
                            </td>
                            <td>
                                ${data[i][1]}
                            </td>
                            <td>
                                <a href="javascript:void(0);" class="delete-todo" data-todoid="${data[i][0]}"><i class="far fa-trash-alt"></i></a>
                            </td>
                        </tr>`;
                    }
                    if(setHtmlPrending != '') {
                        $('#ontodo-tab-pane').find('table tbody').html(setHtmlPrending);
                    }
                    if(setHtmlCompleted != '') {
                        $('#offtodo-tab-pane').find('table tbody').html(setHtmlCompleted);
                    }
                }
                Swal.close();
            } else {
                $('#ontodo-tab-pane').find('table tbody').html('<tr><td colspan="3">No Records Found!</td></tr>');
                $('#offtodo-tab-pane').find('table tbody').html('<tr><td colspan="3">No Records Found!</td></tr>');
                Swal.close();
            }
        }).catch((error) => {
            console.log(error);
        });
    }

    const postToDo = async () => {
        displayLoading();
        let todoName = document.getElementById('todoName');
        let sbumitBtn = document.getElementById('submitBtn');
        sbumitBtn.disabled = true;
        let obj = {
            id: uniqueTimeString(),
            name: todoName.value,
            status: "PENDING",
            actionkey: "SAVE"
        };
        await fetch(apiUrl, {
            method: "POST",
            body: JSON.stringify(obj)
        }).then((response) => {
            return response.text();
        }).then((data) => {
            if(data == "SUCCESS") {
                initData();
                Swal.close();
                displayToast('center', 'Added!');
            }
        }).catch((error) => {
            console.log(error);
        });
    }

    const updateToDo = async (id, name, status, editMode = false) => {
        displayLoading();
        let obj = {
            id: id,
            name: name,
            status: status,
            actionkey: "UPDATE"
        };
        await fetch(apiUrl, {
            method: "POST",
            body: JSON.stringify(obj)
        }).then((response) => {
            return response.text();
        }).then((data) => {
            if(data == "SUCCESS") {
                if(editMode) {
                    closeEditToDoModal();
                }
                Swal.close();
                displayToast('center', 'Updated!');
            }
        }).catch((error) => {
            console.log(error);
        });
    }

    const deleteToDo = async (id, editMode = false) => {
        displayLoading();
        let obj = {
            id: id,
            actionkey: "DELETE"
        };
        await fetch(apiUrl, {
            method: "POST",
            body: JSON.stringify(obj)
        }).then((response) => {
            return response.text();
        }).then((data) => {
            if(data == "SUCCESS") {
                if(editMode) {
                    closeEditToDoModal();
                }
                Swal.close();
                displayToast('center', 'Deleted!');
            }
        }).catch((error) => {
            console.log(error);
        });
    }

    const clearToDo = async () => {
        displayLoading();
        let obj = {
            actionkey: "CLEAR-ALL"
        };
        await fetch(apiUrl, {
            method: "POST",
            body: JSON.stringify(obj)
        }).then((response) => {
            return response.text();
        }).then((data) => {
            if(data == "SUCCESS") {
                Swal.close();
                displayToast('center', 'Done!');
            }
        }).catch((error) => {
            console.log(error);
        });
    }

    $('body').on('change', '.todo-ckb', function() {
        let todoId = $(this).val();
        let todoStatus = ($(this).is(':checked')) ? 'COMPLETED' : 'PENDING';
        let totoName = $(this).parents('tr').find('td:eq(1)').text();
        updateToDo(todoId, totoName, todoStatus);
    });

    $('body').on('click', '.edit-todo', function() {
        let todoId = $(this).parents('tr').find('td:eq(0)').find('.todo-ckb').val();
        let todoStatus = ($(this).parents('tr').find('td:eq(0)').find('.todo-ckb').is(':checked')) ? 'COMPLETED' : 'PENDING';
        let totoName = $(this).parents('tr').find('td:eq(1)').text();
        openEditToDoModal(todoId, totoName, todoStatus); 
    });

    $('.onex-select2').select2({
        width: '100%',
        dropdownParent: $('#todoEditModal'),
        placeholder: 'Select an option',
        allowClear: false
    });

    $('#frmx').validate({
        errorClass: 'onex-error',
        errorElement: 'div',
        rules: {
            todo_name: {
                required: true,
                minlength: 3,
                maxlength: 120
            }
        },
        messages: {
            todo_name: {
                required: 'Please enter todo name',
                minlength: 'Minimum 3 chars required',
                maxlength: 'Maximum 120 chars accepted'
            }
        },
        errorPlacement: function (error, element) {
            error.insertAfter(element);
        },
        highlight: function (element) {
            $(element).removeClass('is-valid').addClass('is-invalid');
            $(element).parent().find('.onex-form-lebel').addClass('onex-error-label');
        },
        unhighlight: function (element) {
            $(element).removeClass('is-invalid').addClass('is-valid');
            $(element).parent().find('.onex-form-lebel').removeClass('onex-error-label');
        },
        submitHandler: function (form) {
            postToDo();
            return false;
        }
    });

    $('#frmx2').validate({
        errorClass: 'onex-error',
        errorElement: 'div',
        ignore: [],
        rules: {
            todo_name: {
                required: true,
                minlength: 3,
                maxlength: 120
            },
            todo_status: {
                required: true
            },
            todo_id: {
                required: true
            }
        },
        messages: {
            todo_name: {
                required: 'Please enter todo name',
                minlength: 'Minimum 3 chars required',
                maxlength: 'Maximum 120 chars accepted'
            },
            todo_status: {
                required: 'Please select todo status'
            },
            todo_id: {
                required: 'Something wrong! try again'
            }
        },
        errorPlacement: function (error, element) {
            error.insertAfter(element);
        },
        highlight: function (element) {
            $(element).removeClass('is-valid').addClass('is-invalid');
            $(element).parents().find('.onex-form-lebel').addClass('onex-error-label');
        },
        unhighlight: function (element) {
            $(element).removeClass('is-invalid').addClass('is-valid');
            $(element).parent().find('.onex-form-lebel').removeClass('onex-error-label');
        }
    });

    $('body').on('click', '#reloadAppBtn', async function() {
        loadToDos();
        $('#ontodo-tab').tab('show');
    });

    $('body').on('click', '#clearAppBtn', async function() {
        Swal.fire({
            title: 'Are you sure?',
            text: "You want to delete your all records",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, clear it!'
        }).then((result) => {
            if(result.isConfirmed) {
                clearToDo();
                setTimeout(() => { $('#ontodo-tab').tab('show'); }, 2000);
            }
        });
    });

    $('body').on('click', '#saveChangesBtn', function() {
        if($('#frmx2').valid()) {
            let todoId = $('#frmx2').find('#todoIdEdit').val();
            let todoName = $('#frmx2').find('#todoNameEdit').val();
            let todoStatus = $('#frmx2').find('#todoStatusEdit').val();
            updateToDo(todoId, todoName, todoStatus, true);
            setTimeout(() => { loadToDos() }, 3000);
        }
    });

    $('body').on('click', '#deleteToDoBtn', function() {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if(result.isConfirmed) {
                let todoId = $('#frmx2').find('#todoIdEdit');
                if(todoId.valid()) {
                    deleteToDo(todoId.val(), true);
                    setTimeout(() => { loadToDos() }, 3000);
                } else {
                    displayAlert('error', 'Sorry!', 'Something Wrong! Please Try Again');
                }
            }
        });
    });

    $('body').on('click', '.delete-todo', function() {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if(result.isConfirmed) {
                let todoId = $(this).data('todoid');
                if(todoId != '' && todoId !== undefined) {
                    deleteToDo(todoId);
                    setTimeout(() => { loadToDos() }, 3000);
                } else {
                    displayAlert('error', 'Sorry!', 'Something Wrong! Please Try Again');
                }
            }
        });
    });

    $('.table-responsive').on('scroll', function () {
        let tabId = $(this).data('fixtabcell');
        if ($(this).scrollLeft() > 0) {
            $('#' + tabId).find('thead').find('tr').find('th:first-child').addClass('fix-tab-cell');
            $('#' + tabId).find('tbody').find('tr').find('td:first-child').addClass('fix-tab-cell');
        } else {
            $('#' + tabId).find('thead').find('tr').find('th:first-child').removeClass('fix-tab-cell');
            $('#' + tabId).find('tbody').find('tr').find('td:first-child').removeClass('fix-tab-cell');
        }
    });

    $("#todoEditModal").on("hidden.bs.modal", function () {
        editToDoInit();
    });

    $('.nav-link').on("shown.bs.tab", function(e) {
        let currentTab = e.target.id;
        let oldTab = e.relatedTarget.id; 
        if (currentTab == 'ontodo-tab' || currentTab == 'offtodo-tab') {
            loadToDos();        
        }
    });

    $('#frmx3').validate({
        errorClass: 'onex-error',
        errorElement: 'div',
        ignore: [],
        rules: {
            auth_email: {
                required: true,
                email: true
            },
            auth_password: {
                required: true
            }
        },
        messages: {
            auth_email: {
                required: 'Please enter email',
                email: 'Invalid email'
            },
            auth_password: {
                required: 'Please enter password'
            }
        },
        errorPlacement: function (error, element) {
            error.insertAfter(element);
        },
        highlight: function (element) {
            $(element).removeClass('is-valid').addClass('is-invalid');
            $(element).parents().find('.onex-form-lebel').addClass('onex-error-label');
        },
        unhighlight: function (element) {
            $(element).removeClass('is-invalid').addClass('is-valid');
            $(element).parent().find('.onex-form-lebel').removeClass('onex-error-label');
        }
    });

    $('body').on('click', '#signInBtn', function() {
        if ($('#frmx3').valid()) {
            if ($('#authEmail').val() == 'arindam.roy.developer@gmail.com' && $('#authPassword').val() == '123456') {
                localStorage.setItem('gsheet-todo-lineup', 'OK');
                $('#authModal').modal('hide');
                loadToDos();
            } else {
                displayAlert('error', 'Sorry!', 'Invalid SignIn, Please Try Again');
            }
        }
    });

    const checkAuth = () => {
        if (localStorage.getItem('gsheet-todo-lineup') == 'OK') {
            loadToDos();
        } else {
            $('#authModal').modal('show');
        }
    }

    $('body').on('click', '#logoutBtn', function() {
        localStorage.removeItem('gsheet-todo-lineup');
        checkAuth();
    });

    checkAuth();
    
});