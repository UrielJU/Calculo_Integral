CálculoIntegral — Simulador Profesional

Resumen
- Simulador interactivo para visualizar Sumas de Riemann, integrales y errores de aproximación.

Archivos principales
- HTML/index.html — Interfaz principal
- CSS/styles.css   — Estilos y temas
- JavaScript/script.js — Lógica: simulador, quiz, historial y utilidades

Mejoras implementadas
- Accesibilidad: enlaces "skip", roles ARIA, manejo de foco en modales y control por teclado.
- Validación de inputs: prevención de límites inválidos y mensajes accesibles en `#simErrors`.
- Export/Import de historial: botón para exportar CSV (`Exportar historial (CSV)`) e importar `.csv` o `.json`.
- Optimización de canvas: muestreo adaptativo y reducción de `devicePixelRatio` en pantallas pequeñas.
- Soporte de función personalizada: el simulador ahora permite escribir expresiones de usuario en `f(x)` y las evalúa con validación básica.
- Tema central añadido: sección específica para **funciones trigonométricas inversas**, con ejemplos y explicación de `arcsin`, `arctan` y el dominio asociado.

Cómo usar
1. Abrir `HTML/index.html` en un navegador moderno.
2. En la sección "Simulador", seleccionar la función, ajustar `a`, `b` y `n`.
3. Presionar "Animar integración" para ver la animación, o "Guardar en historial" para almacenar el resultado.
4. Exportar historial con el botón "Exportar historial (CSV)" o importar archivos `.csv`/`.json` desde "Importar historial".

Notas de entrega
- Recomendado probar en Chrome/Edge/Firefox modernos.
- Si hay problemas de rendimiento en móviles, use un número de rectángulos `n` menor.

Próximos pasos sugeridos
- Añadir validaciones más finas (p.ej. evitar singularidades internas al intervalo).
- Añadir tests unitarios y comprobaciones cross-browser automáticas.
