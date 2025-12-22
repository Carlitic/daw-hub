# 🎓 DAW-Hub

Plataforma educativa interactiva para el Ciclo Formativo de **Desarrollo de Aplicaciones Web (DAW)**.

🌐 **Web Desplegada:** [https://carlitic.github.io/DAW-Hub/](https://carlitic.github.io/DAW-Hub/)

## 🚀 Acerca del Proyecto

**DAW-Hub** es una aplicación web moderna diseñada para modernizar la enseñanza de informática. Permite a los estudiantes acceder a contenido estructurado, realizar tests interactivos y seguir su progreso en tiempo real.

### ✨ Características Principales
*   **📚 Estructura Modular**: Temario organizado por Módulos y unidades.
*   **📝 Visor de Contenido Híbrido**: Soporte para lecciones en Markdown enriquecido y PDFs incrustados.
*   **🧠 Tests Interactivos**: Cuestionarios integrados para autoevaluación.
*   **🏋️ Actividades Prácticas**: Sección dedicada para ejercicios paso a paso.
*   **🔐 Área de Administración**: CMS completo protegidos para que el profesor cree y edite contenido (Editor WYSIWYG, subida de archivos, gestión de tests).
*   **📈 Seguimiento**: Barra de progreso y checks automáticos al completar lecciones.
*   **🎨 Diseño Premium**: Interfaz moderna con Modo Oscuro/Claro, transiciones suaves (Framer Motion) y totalmente responsive.

## 🛠️ Tecnologías Utilizadas

*   **Frontend**: React + TypeScript + Vite
*   **Estilos**: Tailwind CSS + Shadcn/UI
*   **Base de Datos y Auth**: Supabase
*   **Despliegue**: GitHub Pages
*   **Animaciones**: Framer Motion

## 📦 Instalación Local

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/Carlitic/DAW-Hub.git
    cd DAW-Hub
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Ejecutar en desarrollo**:
    ```bash
    npm run dev
    ```

## 🛡️ Administración

Para acceder al panel de administración, el usuario debe tener el rol de `admin` en la base de datos Supabase:

```sql
UPDATE profiles SET role = 'admin' WHERE id = 'uuid-del-usuario';
```

---
Creado por **Carlos Javier Castaños Blanco**.
Proyecto educativo de código abierto.
