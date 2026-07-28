# Mariana OS — Product Principles

> _"Los principios no describen lo que el producto hace. Describen cómo debe pensar el equipo que lo construye."_

---

# 1. Propósito

Este documento define los principios que guían todas las decisiones relacionadas con Mariana OS.

Mientras la visión describe el propósito del proyecto, los principios establecen las reglas que permiten preservar su identidad a medida que evoluciona.

Todo cambio funcional, técnico o visual debe evaluarse frente a estos principios.

Si una decisión entra en conflicto con ellos, deberá justificarse explícitamente mediante un Architectural Decision Record (ADR).

---

# 2. Principios de Producto

## P1. La emoción es el centro del producto

Mariana OS existe para transmitir una historia.

La tecnología es un medio, nunca el objetivo.

Cada módulo, interacción o funcionalidad debe reforzar el vínculo emocional que representa.

### Implicaciones

- El contenido siempre tiene prioridad sobre la interfaz.
- Ninguna decisión técnica debe dificultar la experiencia emocional.
- La narrativa guía el diseño del producto.

---

## P2. La interacción también comunica

El usuario no solo consume contenido.

Lo descubre.

La forma en que se abre una ventana, aparece una carta o se navega entre recuerdos forma parte del mensaje.

### Implicaciones

- Las interacciones deben tener intención.
- Las animaciones deben aportar significado.
- La navegación debe sentirse natural y coherente.

---

## P3. Cada módulo representa una historia

Los módulos no existen únicamente por funcionalidad.

Cada uno representa un aspecto distinto de la relación y debe tener una identidad propia.

### Implicaciones

- Evitar módulos redundantes.
- Diseñar experiencias diferenciadas.
- Mantener una narrativa consistente.

---

# 3. Principios de Experiencia

## E1. Simplicidad antes que espectacularidad

Una interfaz sencilla suele comunicar mejor que una sobrecargada.

El diseño debe transmitir calma, claridad y elegancia.

### Se prioriza

- Espacios amplios.
- Tipografía legible.
- Animaciones.
- Fluidez.

### Se evita

- Saturación visual.
- Efectos innecesarios.
- Interacciones confusas.

---

## E2. Todo movimiento debe tener un propósito

Las animaciones existen para explicar cambios de estado, reforzar la narrativa o mejorar la orientación del usuario.

Nunca deben utilizarse únicamente como decoración.

---

## E3. La experiencia debe sentirse personal

Aunque Mariana OS pueda ser utilizado por otras personas como demostración técnica, todas las decisiones de diseño deben priorizar la experiencia de Mariana.

La personalización forma parte del valor del producto.

---

# 4. Principios de Ingeniería

## I1. Cada componente tiene una única responsabilidad

Los componentes deben ser pequeños, reutilizables y fácilmente mantenibles.

Cada uno debe resolver un único problema.

---

## I2. La arquitectura debe facilitar la evolución

El sistema debe diseñarse para admitir nuevos módulos sin modificar los existentes de forma significativa.

Se favorecerán arquitecturas desacopladas y modulares.

---

## I3. La complejidad debe estar justificada

Toda complejidad adicional debe aportar un beneficio claro.

Se evitarán dependencias, patrones o abstracciones innecesarias.

---

## I4. La tecnología debe ser reemplazable

Siempre que sea posible, las decisiones técnicas deben minimizar el acoplamiento con herramientas o librerías específicas.

El conocimiento del dominio debe permanecer independiente de la infraestructura.

---

## I5. La documentación es parte del producto

La documentación no es un complemento.

Forma parte de la calidad del proyecto.

Toda decisión relevante deberá quedar registrada y mantenerse actualizada.

---

# 5. Principios de Evolución

## V1. Diseñar para crecer

Mariana OS no tiene un final definido.

Debe poder incorporar nuevos módulos, historias y experiencias sin perder coherencia.

---

## V2. Preferir extensión sobre modificación

Siempre que sea posible, el sistema deberá crecer mediante la incorporación de nuevos componentes o módulos, evitando cambios que afecten al comportamiento existente.

---

## V3. La coherencia prevalece sobre la cantidad

Agregar funcionalidades no constituye un objetivo por sí mismo.

Cada nueva característica deberá aportar valor y reforzar la visión del producto.

---

# 6. Criterios para la toma de decisiones

Antes de aprobar una nueva funcionalidad, debe responderse afirmativamente a las siguientes preguntas:

| Pregunta                                      | Objetivo                            |
| --------------------------------------------- | ----------------------------------- |
| ¿Refuerza la visión del producto?             | Mantener la identidad de Mariana OS |
| ¿Aporta valor emocional o funcional?          | Evitar funcionalidades superfluas   |
| ¿Respeta la simplicidad de la experiencia?    | Reducir complejidad innecesaria     |
| ¿Es coherente con la arquitectura?            | Preservar mantenibilidad            |
| ¿Puede evolucionar sin afectar otros módulos? | Facilitar escalabilidad             |

Si alguna respuesta es negativa, la propuesta deberá revisarse o descartarse.

---

# 7. Antipatrones

Las siguientes prácticas se consideran contrarias a los principios del producto:

- Incorporar funcionalidades únicamente por demostrar conocimientos técnicos.
- Añadir animaciones que dificulten la interacción.
- Introducir dependencias sin una necesidad clara.
- Diseñar componentes con múltiples responsabilidades.
- Duplicar lógica entre módulos.
- Priorizar la cantidad de funcionalidades sobre su calidad.
- Sacrificar la experiencia del usuario en favor de decisiones técnicas.

---

# 8. Definición de coherencia

Una decisión se considera coherente cuando:

- Respeta la visión del producto.
- Cumple los principios definidos en este documento.
- Puede justificarse técnica y funcionalmente.
- Mejora la experiencia sin incrementar complejidad innecesaria.
- Facilita la evolución futura del sistema.

---

# 9. Referencias

- **000-product-vision.md** — Define el propósito y la identidad de Mariana OS.
- **003-architecture.md** — Describe cómo los principios se materializan en la arquitectura técnica.
- **009-decisions.md** — Registra excepciones y decisiones arquitectónicas que puedan modificar o complementar estos principios.
