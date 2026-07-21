# GlassElement

`GlassElement` es un contenedor React reutilizable que crea un efecto de vidrio liquido sobre el fondo que queda detras del componente. Su transparencia no depende de pintar una tarjeta blanca semitransparente, sino de aplicar un `backdrop-filter` con un filtro SVG de desplazamiento. Ese filtro distorsiona la imagen de fondo justo dentro del area del componente y concentra la refraccion en los bordes.

## Archivos involucrados

- `GlassElement.jsx`: define el componente, sus props y las variables CSS que controlan tamano, alto, ancho y radio.
- `GlassElement.css`: aplica el layout base, el recorte redondeado, el filtro de fondo y el fallback movil.
- `public/liquid-glass-displace.svg`: filtro SVG por defecto, de `200 x 200`.
- `public/liquid-glass-displace-panel.svg`: variante para paneles de `560 x 280`.
- `public/liquid-glass-displace-card.svg`: variante para tarjetas pequenas de `272 x 104`.
- `public/liquid-glass-displace-result.svg`: variante para estado de resultado de `560 x 470`.
- `public/liquid-glass-displace-admin.svg`: variante para estado admin de `560 x 540`.

## API del componente

```jsx
<GlassElement
  as="section"
  className="shortener-card"
  width="min(560px, calc(100vw - 32px))"
  height="auto"
  radius="var(--radius-lg)"
  style={{
    "--glass-element-filter": 'url("/liquid-glass-displace-panel.svg#displace")',
  }}
>
  Contenido
</GlassElement>
```

Props principales:

- `as`: cambia la etiqueta renderizada. Por defecto usa `div`, pero puede ser `section`, `article`, `button`, etc.
- `size`: define ancho y alto cuando no se pasan `width` o `height`. Si es numero, se convierte a `px`.
- `width`: sobrescribe el ancho. Acepta numeros o expresiones CSS como `min(...)`.
- `height`: sobrescribe el alto. Acepta numeros, `auto` o cualquier valor CSS valido.
- `radius`: controla el `border-radius`. Si es numero, se convierte a `px`.
- `style`: permite inyectar variables CSS, especialmente `--glass-element-filter`.

Internamente, el componente traduce esas props a variables CSS:

```jsx
style={{
  "--glass-element-width": elementWidth,
  "--glass-element-height": elementHeight,
  "--glass-element-radius": borderRadius,
  ...style,
}}
```

Luego el CSS consume esas variables:

```css
.glass-element {
  width: var(--glass-element-width);
  height: var(--glass-element-height);
  border-radius: var(--glass-element-radius);
}
```

## Como se genera el efecto de vidrio

El efecto vive en esta cadena de `backdrop-filter`:

```css
backdrop-filter:
  blur(0.5px)
  var(--glass-element-filter, url("/liquid-glass-displace.svg#displace"))
  blur(1px)
  brightness(1.1)
  saturate(1.5);
```

Paso a paso:

1. `background: rgba(255, 255, 255, 0.001)` hace que el elemento exista visualmente para el navegador sin cubrir realmente el fondo. Es casi transparente.
2. `backdrop-filter` toma los pixeles que estan detras del componente, no los hijos del componente.
3. `blur(0.5px)` suaviza levemente el fondo antes de desplazarlo.
4. `url("/liquid-glass-displace.svg#displace")` aplica el filtro SVG llamado `displace`.
5. `blur(1px)` suaviza el resultado desplazado para evitar bordes duros o pixelados.
6. `brightness(1.1)` levanta un poco la luz del fondo filtrado.
7. `saturate(1.5)` aumenta la separacion cromatica y ayuda a que la refraccion se perciba como vidrio.

Tambien se define `-webkit-backdrop-filter` con la misma cadena para compatibilidad con navegadores basados en WebKit.

## Como funciona el SVG

El SVG no se muestra como imagen en pantalla. Se usa como filtro referenciado desde CSS:

```css
url("/liquid-glass-displace.svg#displace")
```

Dentro del SVG hay un `<filter id="displace">`. Ese filtro usa un `feImage` como mapa de desplazamiento:

```svg
<feImage
  x="0"
  y="0"
  height="200"
  width="200"
  result="displacementMap"
  href="data:image/svg+xml;base64,..."
/>
```

Ese mapa tiene tres ideas importantes:

- Un degradado rojo horizontal (`X`) que controla el desplazamiento en el eje X.
- Un degradado verde vertical (`Y`) que controla el desplazamiento en el eje Y.
- Un rectangulo interior gris y desenfocado que neutraliza el centro para que el efecto sea mas fuerte cerca del borde y mas suave hacia el interior.

Luego el filtro desplaza el fondo tres veces:

```svg
<feDisplacementMap in="SourceGraphic" in2="displacementMap" scale="102" xChannelSelector="R" yChannelSelector="G" />
<feDisplacementMap in="SourceGraphic" in2="displacementMap" scale="101" xChannelSelector="R" yChannelSelector="G" />
<feDisplacementMap in="SourceGraphic" in2="displacementMap" scale="100" xChannelSelector="R" yChannelSelector="G" />
```

Cada desplazamiento se queda con un canal de color distinto mediante `feColorMatrix`: rojo, verde y azul. Despues se mezclan con `feBlend mode="screen"`. Como cada canal se desplaza con una intensidad apenas distinta (`102`, `101`, `100`), aparece una aberracion cromatica sutil, parecida a la luz separandose al pasar por vidrio.

## Por que la refraccion aparece en los bordes

El mapa de desplazamiento esta disenado para que el centro sea casi neutro y los bordes tengan mayor variacion. La clave esta en el rectangulo interior:

```svg
<rect
  x="10"
  y="10"
  height="180"
  width="180"
  fill="#808080"
  rx="20"
  ry="20"
  filter="blur(10px)"
/>
```

`#808080` es el punto medio de un mapa de desplazamiento: no empuja demasiado los pixeles. Al colocarlo dentro del SVG y desenfocarlo con `blur(10px)`, el centro queda estable y la transicion hacia los bordes queda gradual. Eso evita que todo el componente parezca derretido y concentra la sensacion de refraccion en el contorno.

## Problema: el componente cambia de tamano

El filtro SVG usa `filterUnits="userSpaceOnUse"`, asi que sus dimensiones importan. Si el componente mide `560 x 280`, conviene usar un mapa SVG de `560 x 280`. Si se usa el filtro base de `200 x 200` sobre una superficie muy distinta, el efecto puede verse estirado, desalineado o demasiado intenso.

Solucion recomendada:

1. Define el tamano real del componente con `width`, `height` o `size`.
2. Usa una variante SVG que tenga el mismo ratio y dimensiones aproximadas.
3. Pasa esa variante con `--glass-element-filter`.

Ejemplo para un panel ancho:

```jsx
<GlassElement
  width="min(560px, calc(100vw - 32px))"
  height="auto"
  radius="var(--radius-lg)"
  style={{
    "--glass-element-filter": 'url("/liquid-glass-displace-panel.svg#displace")',
  }}
>
  ...
</GlassElement>
```

Ejemplo para una tarjeta pequena:

```css
.usage-stat-glass {
  --glass-element-filter: url("/liquid-glass-displace-card.svg#displace");
}
```

Si el contenido tiene altura dinamica, como ocurre con `height="auto"`, se debe elegir el SVG que represente mejor el estado visual esperado. En `ShortenUrl.jsx` se resuelve cambiando el filtro segun estado:

```jsx
const cardFilter =
  cardState === "admin"
    ? 'url("/liquid-glass-displace-admin.svg#displace")'
    : cardState === "result"
      ? 'url("/liquid-glass-displace-result.svg#displace")'
      : 'url("/liquid-glass-displace-panel.svg#displace")';
```

## Problema: el efecto se ve demasiado duro

La dureza suele venir de tres lugares:

- El mapa SVG tiene una transicion muy brusca entre borde y centro.
- El `scale` de `feDisplacementMap` esta demasiado alto para el tamano del componente.
- El `backdrop-filter` no suaviza despues del desplazamiento.

Soluciones:

1. Aumentar el `filter="blur(...)"` del rectangulo interior del mapa. En las variantes actuales se usa `blur(10px)`.
2. Reducir los valores de `scale` en `feDisplacementMap`. Por ejemplo, pasar de `102 / 101 / 100` a valores mas bajos si la refraccion resulta exagerada.
3. Mantener el segundo `blur(1px)` en el CSS para suavizar el resultado final.

Regla practica:

- Mas `scale`: refraccion mas fuerte y mas visible.
- Menos `scale`: vidrio mas discreto.
- Mas blur en el mapa: borde mas suave.
- Menos blur en el mapa: borde mas marcado.

## Problema: no parece transparente

Para que se sienta como vidrio real, el componente no debe tapar el fondo. Por eso el fondo base es casi invisible:

```css
background: rgba(255, 255, 255, 0.001);
```

Si se sube demasiado el alpha, el elemento empieza a parecer una tarjeta semitransparente normal. La transparencia real se logra dejando pasar el fondo y transformandolo con `backdrop-filter`.

Cuando se necesita mas presencia visual, es mejor agregar luces muy sutiles en capas internas o pseudo-elementos, como:

```css
.usage-stat-glass::before {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.08) 0%,
    rgba(255, 255, 255, 0) 58%
  );
  mix-blend-mode: overlay;
}
```

Esto suma brillo sin convertir el vidrio en una placa opaca.

## Problema: el borde no coincide con el radio del componente

El radio visual del componente y el radio dibujado dentro del mapa SVG deben coincidir aproximadamente.

En React:

```jsx
<GlassElement radius="var(--radius-lg)" />
```

En CSS:

```css
.glass-element {
  overflow: hidden;
  border-radius: var(--glass-element-radius);
}
```

En el SVG:

```svg
<rect x="10" y="10" width="540" height="260" rx="24" ry="24" />
```

Si el componente usa un radio grande pero el SVG tiene un radio pequeno, la refraccion no seguira bien las esquinas. Si el SVG usa un radio mayor que el componente, el borde refractado parecera separado del recorte real.

## Fallback en moviles y punteros tactiles

El CSS desactiva el filtro en pantallas pequenas o dispositivos tactiles:

```css
@media (max-width: 640px), (pointer: coarse) {
  .glass-element {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}
```

Esto evita problemas de rendimiento y compatibilidad. En ese caso el componente conserva una apariencia translucida simple, pero sin refraccion SVG.

## Checklist para crear una nueva variante

1. Decide el tamano visual del componente: ancho, alto y radio.
2. Crea un SVG con el mismo `width`, `height` y `viewBox`.
3. Ajusta el `<filter>` con las mismas dimensiones.
4. Ajusta el `feImage` para que coincida con el tamano del SVG.
5. Dentro del mapa embebido, usa degradado rojo para X y verde para Y.
6. Agrega un rectangulo interior gris `#808080`, separado unos `10px` del borde.
7. Dale al rectangulo interior el mismo radio aproximado del componente.
8. Aplica `filter="blur(10px)"` o un valor cercano para suavizar la transicion.
9. Ajusta `scale` en los tres `feDisplacementMap` hasta que el borde refracte sin deformar demasiado el centro.
10. Usa la nueva variante con `--glass-element-filter`.

## Resumen mental

`GlassElement` no dibuja un vidrio encima del contenido: recorta un area, mira lo que hay detras, desplaza esos pixeles con un mapa SVG y suaviza el resultado. El centro queda casi transparente y estable; los bordes reciben mas desplazamiento, brillo y saturacion. El resultado es una superficie que parece transparente, pero con refraccion real en el contorno.
