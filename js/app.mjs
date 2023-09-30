import { saveT, getT, deleteT, getOne, updateTarea } from "./firebase.mjs";

let boton = document.getElementById("btn");
const tbody = document.getElementById("tabla"); // Obtener el tbody por su ID

/////////////////////////////////////////////////////////AGREGADO DE TAREAS/////////////////////////////////////////////////////////////////////////////////////////////
// Agregar un evento de clic al botón de agregar tarea
boton.addEventListener("click", function() {
  // Obtener el valor del input de tarea
  let tarea = document.getElementById("tarea").value;
  // Obtener la fecha actual
  const fechaActual = new Date();

  // Formatear la fecha en un formato legible
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  };
  const fecha = fechaActual.toLocaleDateString("es-ES", options);

  if (tarea === "") {
    Swal.fire({
      icon: "error",
      text: "Debe indicar una tarea"
    });
    return;
  } else {
    // Agregar la tarea a Firebase Realtime Database
    saveT(tarea, fecha);
    // Muestra un SweetAlert de éxito
    Swal.fire({
      icon: "success",
      text: "Tarea guardada con éxito"
    });
    // Limpiar el input de tarea
    document.getElementById("tarea").value = "";
    cargarTareas();
  }
});
///////////////////////////////////////////////////////FIN AGREGADO DE TAREAS///////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////LISTADO DE TAREAS/////////////////////////////////////////////////////////////////////////////////////////////
// Función para cargar y mostrar las tareas en la tabla
async function cargarTareas() {
  const tareas = await getT(); // Obtener las tareas desde Firebase Firestore

  // Limpiar el contenido actual del tbody
  tbody.innerHTML = "";

  // Recorrer las tareas y agregarlas al tbody
  tareas.forEach(tarea => {
    const fila = document.createElement("tr");

    // Crear celdas para la tarea y la fecha
    const celdaTarea = document.createElement("td");
    celdaTarea.textContent = tarea.tarea;

    const celdaFecha = document.createElement("td");
    celdaFecha.textContent = tarea.fecha;

    // Crear una celda para los botones de editar y eliminar
    const celdaAcciones = document.createElement("td");

    const botonEditar = document.createElement("button");
    botonEditar.textContent = "Editar";
    botonEditar.className = "btn btn-warning me-2";

    const botonEliminar = document.createElement("button");
    botonEliminar.textContent = "Eliminar";
    botonEliminar.className = "btn btn-danger";

    // Agregar botones a la celda de acciones
    celdaAcciones.appendChild(botonEditar);
    celdaAcciones.appendChild(botonEliminar);

    // Agregar celdas a la fila
    fila.appendChild(celdaTarea);
    fila.appendChild(celdaFecha);
    fila.appendChild(celdaAcciones);

    // Agregar fila al tbody
    tbody.appendChild(fila);

    // Agregar listeners a los botones
    botonEditar.addEventListener("click", () => {
      editarTarea(tarea.id); // Llamar a la función de edición con el ID de la tarea
    });

    botonEliminar.addEventListener("click", () => {
      eliminarTarea(tarea.id, fila); // Llamar a la función de eliminación con el ID de la tarea
    });
  });
}
////////////////////////////////////////////////////////FIN LISTADO DE TAREAS//////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////EDICION DE TAREAS/////////////////////////////////////////////////////////////////////////////////////////////
// Funcion para editar tareas.
// Función para editar tareas.
async function editarTarea(tareaId) {
  // Lógica para editar la tarea con el ID proporcionado
  //console.log("Editar tarea con ID:", tareaId);

  // Obtener la tarea existente desde Firebase Firestore
  const tarea = await getOne(tareaId);

  // Verificar si se obtuvo una tarea válida
  if (tarea) {
    // Crear el modal de Bootstrap dinámicamente
    const modal = document.createElement("div");
    modal.className = "modal fade";
    modal.id = "editarModal";
    modal.tabIndex = -1;
    modal.setAttribute("aria-labelledby", "editarModalLabel");
    modal.setAttribute("aria-hidden", "true");

    const modalDialog = document.createElement("div");
    modalDialog.className = "modal-dialog";

    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";

    const modalHeader = document.createElement("div");
    modalHeader.className = "modal-header";

    const modalTitle = document.createElement("h5");
    modalTitle.className = "modal-title";
    modalTitle.id = "editarModalLabel";
    modalTitle.textContent = "Editar Tarea";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "btn-close";
    closeButton.setAttribute("data-bs-dismiss", "modal");
    closeButton.setAttribute("aria-label", "Close");

    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);

    const modalBody = document.createElement("div");
    modalBody.className = "modal-body";

    // Contenido del modal
    const modalInput = document.createElement("input");
    modalInput.type = "text";
    modalInput.className = "form-control";
    modalInput.id = "modalInput";
    modalInput.placeholder = "Nueva descripción";
    modalInput.value = tarea.tarea;

    modalBody.appendChild(modalInput);

    const modalFooter = document.createElement("div");
    modalFooter.className = "modal-footer";

    const closeButtonModal = document.createElement("button");
    closeButtonModal.type = "button";
    closeButtonModal.className = "btn btn-secondary";
    closeButtonModal.setAttribute("data-bs-dismiss", "modal");
    closeButtonModal.textContent = "Cerrar";

    const guardarCambiosBtn = document.createElement("button");
    guardarCambiosBtn.type = "button";
    guardarCambiosBtn.className = "btn btn-primary";
    guardarCambiosBtn.id = "guardarCambiosBtn";
    guardarCambiosBtn.textContent = "Guardar Cambios";

    modalFooter.appendChild(closeButtonModal);
    modalFooter.appendChild(guardarCambiosBtn);

    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalContent.appendChild(modalFooter);

    modalDialog.appendChild(modalContent);
    modal.appendChild(modalDialog);

    // Agregar el modal al cuerpo del documento
    document.body.appendChild(modal);

    // Mostrar el modal de Bootstrap
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();

    guardarCambiosBtn.addEventListener("click", async () => {
      const nuevaDescripcion = modalInput.value;

      // Verificar si se proporcionó una descripción válida
      if (nuevaDescripcion.trim() !== "") {
        // Actualizar el campo "tarea" de la tarea obtenida con la nueva descripción
        tarea.tarea = nuevaDescripcion;

        // Actualizar la tarea en Firebase Firestore
        await updateTarea(tareaId, tarea);

        // Ocultar el modal
        modalInstance.hide();

        // Mostrar un mensaje de éxito
        Swal.fire({
          icon: "success",
          text: "Tarea modificada con éxito"
        });

        // Opcional: Actualizar la lista de tareas después de editar
        cargarTareas();
      } else {
        // Mostrar un mensaje de error si no se proporcionó una descripción válida
        Swal.fire({
          icon: "error",
          text: "Por favor, ingrese una descripción válida"
        });
      }
    });
  } else {
    // No se pudo encontrar la tarea con el ID proporcionado
    Swal.fire({
      icon: "error",
      text: "No se encontró la tarea con el ID proporcionado"
    });
  }
}
/////////////////////////////////////////////////////////EDICION DE TAREAS/////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////BORRADO DE TAREAS/////////////////////////////////////////////////////////////////////////////////////////////
//Funcion para borrar tareas.
async function eliminarTarea(tareaId, fila) {
  // Lógica para eliminar la tarea con el ID proporcionado
  //console.log("Eliminar tarea con ID:", tareaId);
  try {
    await deleteT(tareaId);

    //Eliminar la fila correspondiente
    fila.remove();

    //Alerta con sweet alert
    Swal.fire({
      icon: "success",
      text: "Tarea eliminada con éxito"
    });
    cargarTareas();
  } catch (error) {
    //Mostrar sweet alert
    Swal.fire({
      icon: "error",
      text: "Hubo un error al eliminar la tarea"
    });
  }
}
/////////////////////////////////////////////////////////BORRADO DE TAREAS/////////////////////////////////////////////////////////////////////////////////////////////

// Llama a la función para cargar y mostrar las tareas al cargar la página
cargarTareas();
