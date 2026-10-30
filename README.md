# Swiss React Components

A repository of reusable React + TypeScript components in a Swiss (International Typographic Style) design language: grid-based, high-contrast, minimal. It is not an npm package; copy the components you need into your site.

The API follows the conventions of the [swiss-ui](https://github.com/swiss-ui/react) design system (`data-component` / `data-variant` / `data-size` attributes, `--swiss-*` CSS tokens), but the code here is an independent implementation.

## Run the showcase

```bash
npm install
npm run dev
```

The showcase renders every component with dummy data. Build with `npm run build`.

## Structure

```
src/
  components/   Components (import from "components/index.ts")
  mocks/        Seeded dummy data for every component
  showcase/     Demo page that renders everything
  styles/       tokens.css (design tokens) and swiss.css (component styles)
```

## Components

| Group | Components |
| --- | --- |
| Layout | Box, Text, Heading, Container, Stack, Grid, GridItem, Card |
| Forms | Button, Input, Textarea, Select, Checkbox, Radio / RadioGroup, Switch, SearchBar, ComboBox, Slider, Stepper, DatePicker (single and range), FileUploader, Field |
| Navigation | Navbar (hamburger, megamenu), Breadcrumbs, Sidebar, Pagination, Tabs, Footer |
| Containers | Modal, Drawer, Accordion, Carousel, Tooltip, Dropdown |
| Data | DataTable (sort, filter, select, paginate) |
| Charts | LineChart (line/area), BarChart (grouped/stacked), PieChart (pie/donut), ScatterChart, Sparkline, Gauge |
| Feedback | Badge, BadgeAnchor, Tag, Alert, Spinner, Progress, Steps, Skeleton, Toast |
| Page sections | Hero, FormContainer, Feed, Testimonial, LogoStrip, VideoPlayer, Avatar |

## Usage

```tsx
import './styles/swiss.css'
import { Button, Input, Field, LineChart } from './components'
import { mock, months } from './mocks/data'

<Field label="Email"><Input type="email" /></Field>
<Button variant="outline">Save</Button>
<LineChart series={mock.monthly} labels={months} />
```

Form controls work controlled or uncontrolled. Charts are plain SVG with no extra dependencies.

## Mock data

`src/mocks/data.ts` exports `mock` (ready-made data for every component) and generators `makeOrders`, `makeSeries` and `makeScatter`. Output is deterministic (seeded), so renders are identical on each load. Replace with real data by passing your own props.

## Theming

Override tokens on `:root` or any ancestor:

```css
:root {
  --swiss-color-primary: #0055cc;
  --swiss-spacing-4: 1rem;
}
```

## Accessibility

Native elements and ARIA roles throughout. Modal and Drawer trap focus and close on Escape; Tabs, ComboBox and Dropdown support keyboard navigation; Alert, Toast, Progress and Spinner expose live-region or status roles.
