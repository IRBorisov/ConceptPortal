# Frontend Developer guidelines

Styling conventions
- static > conditional static > props. All dynamic styling should go in styles props
- dimensions = rectangle + outer layout

<details>
<summary>clsx className groupind and order</summary>
  <pre>
  - layer: z-position
  - outer layout: fixed bottom-1/2 left-0 -translate-x-1/2
  - rectangle: mt-3 min-w-fit min-w-10 flex-grow shrink-0
  - inner layout: px-3 py-2 flex flex-col gap-3 justify-between items-center
  - overflow behavior: overflow-scroll
  - border: borer-2 outline-none shadow-md
  - colors: clr-controls
  - text: text-start text-sm font-semibold whitespace-nowrap
  - behavior modifiers: select-none disabled:cursor-not-allowed
  - transitions: 
  </pre>
</details>