# Frontend Developer guidelines

Styling conventions
- static > conditional static > props. All dynamic styling should go in styles props
- dimensions = rectangle + outer layout

<details>
<summary>clsx className groupind and order</summary>
  <pre>
  - layer: z-position
  - outer layout: fixed bottom-1/2 left-0 -translate-x-1/2
  - rectangle: mt-3 w-full min-w-10 h-fit
  - inner layout: px-3 py-2 flex flex-col gap-3 justify-start items-center
  - overflow behavior: overflow-auto
  - border: borer-2 outline-none shadow-md
  - colors: clr-controls
  - text: text-start text-sm font-semibold whitespace-nowrap
  - behavior modifiers: select-none disabled:cursor-not-allowed
  - transitions: 
  </pre>
</details>