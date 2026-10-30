import React, { useState } from 'react'
import {
  Accordion, Alert, Avatar, Badge, BadgeAnchor, BarChart, Breadcrumbs, Button, Card, Carousel, Checkbox, ComboBox, Container,
  DataTable, DatePicker, Drawer, Dropdown, Feed, Field, FileUploader, Footer, FormContainer, Gauge, Grid, GridItem, Heading, Hero, Input,
  LineChart, LogoStrip, Modal, Navbar, Pagination, PieChart, Progress, Radio, RadioGroup, ScatterChart, SearchBar, Select, Sidebar,
  Skeleton, Slider, Spinner, Sparkline, Stack, Stepper, Steps, Switch, Tabs, Tag, Testimonial, Text, Textarea, ToastProvider, Tooltip,
  useToast, VideoPlayer,
} from '../components'
import type { Column } from '../components'
import { mock, months } from '../mocks/data'
import type { Order } from '../mocks/data'

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="showcase-section">
      <Heading level={2} style={{ marginBottom: 'var(--swiss-spacing-6)' }}>{title}</Heading>
      <Stack gap={6}>{children}</Stack>
    </section>
  )
}

function Demo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="showcase-label">{label}</p>
      <div className="showcase-demo">{children}</div>
    </div>
  )
}

const statusColor = { Paid: 'success', Pending: 'warning', Refunded: 'neutral' } as const

const orderColumns: Column<Order>[] = [
  { key: 'id', header: 'Order #', sortable: true },
  { key: 'customer', header: 'Customer', sortable: true },
  { key: 'product', header: 'Product', sortable: true },
  { key: 'status', header: 'Status', sortable: true, render: (r) => <Badge color={statusColor[r.status]}>{r.status}</Badge> },
  { key: 'date', header: 'Date', sortable: true },
  { key: 'amount', header: 'Amount (CHF)', sortable: true, align: 'right', render: (r) => r.amount.toFixed(2) },
]

function FormsSection() {
  const [theme, setTheme] = useState('light')
  const [size, setSize] = useState(3)
  const { toast } = useToast()
  return (
    <Section id="forms" title="1. Input controls & form elements">
      <Demo label="Buttons">
        <Stack direction="row" gap={3} wrap align="center">
          <Button>Solid</Button><Button variant="outline">Outline</Button><Button variant="dark">Dark</Button><Button variant="ghost">Ghost</Button>
          <Button size="sm">Small</Button><Button size="lg">Large</Button><Button loading>Saving</Button><Button disabled>Disabled</Button>
          <Button onClick={() => toast('Saved successfully', 'success')}>Show toast</Button>
        </Stack>
      </Demo>
      <Demo label="Text fields">
        <Grid cols={3} gap={4}>
          <Field label="Name" htmlFor="n" hint="As on your passport"><Input id="n" placeholder="Anna Müller" /></Field>
          <Field label="Email" htmlFor="e" error="Enter a valid email"><Input id="e" type="email" defaultValue="anna@" invalid describedBy="e" /></Field>
          <Field label="Amount" htmlFor="a"><Input id="a" leftAddon="CHF" rightAddon=".00" defaultValue="120" /></Field>
          <Field label="Password" htmlFor="p"><Input id="p" type="password" defaultValue="secret" /></Field>
          <Field label="Disabled" htmlFor="d"><Input id="d" disabled defaultValue="Read only" /></Field>
          <Field label="Message" htmlFor="m"><Textarea id="m" autoResize placeholder="Type something…" /></Field>
        </Grid>
      </Demo>
      <Demo label="Search bar"><SearchBar placeholder="Search the site…" onSearch={() => undefined} /></Demo>
      <Demo label="Select · Combo box · Dropdown menu">
        <Grid cols={3} gap={4}>
          <Field label="Native select"><Select placeholder="Choose country" options={mock.countries} /></Field>
          <Field label="Combo box (type to filter)"><ComboBox options={mock.countries} placeholder="Search country…" /></Field>
          <Field label="Dropdown menu">
            <Dropdown label="Actions" entries={[
              { type: 'label', label: 'Item' }, { label: 'Edit' }, { label: 'Duplicate' }, { type: 'separator' }, { label: 'Archive', disabled: true }, { label: 'Delete' },
            ]} />
          </Field>
        </Grid>
      </Demo>
      <Demo label="Checkbox · Radio · Switch">
        <Grid cols={3} gap={4}>
          <Stack gap={2}><Checkbox label="Newsletter" defaultChecked /><Checkbox label="Terms" /><Checkbox label="Partially selected" indeterminate /></Stack>
          <RadioGroup legend="Theme" value={theme} onChange={setTheme}><Radio value="light" label="Light" /><Radio value="dark" label="Dark" /><Radio value="auto" label="System" /></RadioGroup>
          <Stack gap={2}><Switch label="Notifications" defaultChecked /><Switch label="Beta features" /><Switch label="Disabled" disabled /></Stack>
        </Grid>
      </Demo>
      <Demo label="Slider · Stepper">
        <Grid cols={2} gap={6}>
          <Field label="Volume"><Slider defaultValue={40} format={(v) => `${v}%`} /></Field>
          <Field label="Guests"><Stepper value={size} onChange={setSize} min={1} max={10} /></Field>
        </Grid>
      </Demo>
      <Demo label="Date picker (single and range)">
        <Grid cols={2} gap={6}>
          <Field label="Date"><DatePicker value="2026-10-30" /></Field>
          <Field label="Stay"><DatePicker range /></Field>
        </Grid>
      </Demo>
      <Demo label="File uploader"><FileUploader initialFiles={mock.files} /></Demo>
    </Section>
  )
}

function NavSection() {
  const [page, setPage] = useState(3)
  return (
    <Section id="navigation" title="2. Navigation & wayfinding">
      <Demo label="Header / navbar with megamenu (resize for hamburger)">
        <div style={{ minHeight: 260 }}>
          <Navbar brand="Helvetia" links={mock.navLinks} mega={{ label: 'Explore', groups: mock.megaGroups }} actions={<><Button variant="ghost" size="sm">Sign in</Button><Button size="sm">Get started</Button></>} />
        </div>
      </Demo>
      <Demo label="Breadcrumbs"><Breadcrumbs items={[{ label: 'Home', href: '#' }, { label: 'Shop', href: '#' }, { label: 'Watches' }]} /></Demo>
      <Demo label="Sidebar + Tabs">
        <div style={{ display: 'flex', gap: 'var(--swiss-spacing-4)' }}>
          <Sidebar sections={mock.sidebar} />
          <div style={{ flex: 1 }}>
            <Tabs items={[
              { id: 'o', label: 'Overview', content: 'Overview content with key metrics.' },
              { id: 'a', label: 'Activity', content: 'Recent activity goes here.' },
              { id: 's', label: 'Settings', content: 'Account settings.' },
            ]} />
            <div style={{ height: 16 }} />
            <Tabs orientation="vertical" items={[{ id: '1', label: 'Profile', content: 'Vertical tab: profile' }, { id: '2', label: 'Security', content: 'Vertical tab: security' }]} />
          </div>
        </div>
      </Demo>
      <Demo label="Pagination"><Pagination page={page} pageCount={20} onChange={setPage} /></Demo>
      <Demo label="Footer sitemap"><Footer columns={mock.footer} legal="© 2026 Helvetia AG. All rights reserved." /></Demo>
    </Section>
  )
}

function ContainersSection() {
  const [modal, setModal] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const slides = ['Alpine', 'Lake', 'City'].map((t, i) => (
    <div key={t} style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', background: ['#d52b1e', '#111', '#0b63ce'][i], color: '#fff', fontSize: 28, fontWeight: 700 }}>{t}</div>
  ))
  return (
    <Section id="containers" title="3. Containers & layout groupings">
      <Demo label="Cards">
        <Grid cols={3} gap={4}>
          {['Matterhorn Watch', 'Alpine Chocolate', 'Swiss Knife'].map((t, i) => (
            <Card key={t}>
              <div style={{ height: 100, background: ['#eee', '#ddd', '#ccc'][i], marginBottom: 12 }} />
              <Heading level={4}>{t}</Heading>
              <Text size="sm" muted style={{ margin: '4px 0 12px' }}>Precision crafted in Switzerland.</Text>
              <Button size="sm" variant="outline">View details</Button>
            </Card>
          ))}
        </Grid>
      </Demo>
      <Demo label="Modal · Drawer · Tooltip">
        <Stack direction="row" gap={3}>
          <Button onClick={() => setModal(true)}>Open modal</Button>
          <Button variant="outline" onClick={() => setDrawer(true)}>Open drawer</Button>
          <Tooltip content="I am a tooltip"><Button variant="ghost">Hover me</Button></Tooltip>
        </Stack>
        <Modal isOpen={modal} onClose={() => setModal(false)} title="Confirm action" footer={<><Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button><Button onClick={() => setModal(false)}>Confirm</Button></>}>
          <Text>Are you sure you want to continue? This is a mock dialog.</Text>
        </Modal>
        <Drawer isOpen={drawer} onClose={() => setDrawer(false)} title="Cart summary">
          <Stack gap={3}>{mock.orders.slice(0, 3).map((o) => <Text key={o.id}>{o.product} — CHF {o.amount}</Text>)}</Stack>
        </Drawer>
      </Demo>
      <Demo label="Accordion"><Accordion items={mock.faq} defaultOpen={['a']} /></Demo>
      <Demo label="Carousel"><Carousel slides={slides} autoPlayMs={4000} /></Demo>
      <Demo label="Table (sortable, filterable, selectable, paginated)">
        <DataTable columns={orderColumns} rows={mock.orders} rowKey={(r) => r.id} searchable selectable caption="Recent orders" />
      </Demo>
    </Section>
  )
}

function FeedbackSection() {
  const [pct, setPct] = useState(45)
  const [tags, setTags] = useState(['Design', 'Finance'])
  const { toast } = useToast()
  return (
    <Section id="feedback" title="4. Informational & feedback elements">
      <Demo label="Progress · Spinner · Steps">
        <Stack gap={4}>
          <Progress value={pct} /><Slider value={pct} onChange={setPct} label="Progress value" />
          <Stack direction="row" gap={4} align="center"><Spinner size="sm" /><Spinner /><Spinner size="lg" /></Stack>
          <Steps steps={mock.timeline} current={1} />
        </Stack>
      </Demo>
      <Demo label="Skeleton">
        <Stack direction="row" gap={4}><Skeleton circle width={48} /><div style={{ flex: 1 }}><Skeleton lines={3} /></div></Stack>
      </Demo>
      <Demo label="Badges · Notification dots · Tags">
        <Stack direction="row" gap={6} align="center" wrap>
          <Badge>Default</Badge><Badge color="primary">Primary</Badge><Badge color="success">Success</Badge><Badge color="warning">Warning</Badge><Badge color="info">Info</Badge>
          <BadgeAnchor count={5}><Button variant="outline">Inbox</Button></BadgeAnchor>
          <BadgeAnchor dot><Avatar name="Anna Müller" /></BadgeAnchor>
          {tags.map((t) => <Tag key={t} onRemove={() => setTags(tags.filter((x) => x !== t))}>{t}</Tag>)}
          {mock.tags.filter((t) => !tags.includes(t)).map((t) => <Tag key={t} onClick={() => setTags([...tags, t])}>{`+ ${t}`}</Tag>)}
        </Stack>
      </Demo>
      <Demo label="Alerts & toasts">
        <Stack gap={3}>
          <Alert title="Heads up" description="Maintenance window starts at 22:00." />
          <Alert variant="success" title="Saved" description="Your changes were stored." />
          <Alert variant="warning" title="Almost full" description="Storage at 92%." />
          <Alert variant="error" title="Payment failed" description="Card was declined." actions={<Button size="sm" variant="outline">Retry</Button>} />
          <div><Button onClick={() => toast('Item added to cart', 'success')}>Add to cart</Button></div>
        </Stack>
      </Demo>
    </Section>
  )
}

function ChartsSection() {
  return (
    <Section id="charts" title="Charts & graphs">
      <Grid cols={2} gap={6}>
        <GridItem><Card title="Revenue vs costs (line)"><LineChart series={mock.monthly} labels={months} /></Card></GridItem>
        <GridItem><Card title="Revenue vs costs (area)"><LineChart area series={mock.monthly} labels={months} /></Card></GridItem>
        <GridItem><Card title="Sales by city (grouped bars)"><BarChart series={mock.quarterly} labels={['Q1', 'Q2', 'Q3', 'Q4']} /></Card></GridItem>
        <GridItem><Card title="Sales by city (stacked bars)"><BarChart stacked series={mock.quarterly} labels={['Q1', 'Q2', 'Q3', 'Q4']} /></Card></GridItem>
        <GridItem><Card title="Traffic sources (pie)"><PieChart data={mock.share} /></Card></GridItem>
        <GridItem><Card title="Traffic sources (donut)"><PieChart donut data={mock.share} centerLabel="1,040" /></Card></GridItem>
        <GridItem><Card title="Segments (scatter)"><ScatterChart series={mock.scatter} /></Card></GridItem>
        <GridItem>
          <Card title="KPIs">
            <Stack direction="row" gap={8} align="center" wrap>
              <Gauge value={72} label="Satisfaction" />
              <Stack gap={2}><Text size="sm" muted>Weekly trend</Text><Sparkline data={mock.monthly[0].data} /><Text size="sm" muted>Costs</Text><Sparkline data={mock.monthly[1].data} color="var(--swiss-chart-2)" /></Stack>
            </Stack>
          </Card>
        </GridItem>
      </Grid>
    </Section>
  )
}

function PageSection() {
  const [slide, setSlide] = useState(0)
  return (
    <Section id="sections" title="5. Macro-page sections">
      <Demo label="Hero"><Hero eyebrow="New" title="Design with clarity." subtitle="Accessible, grid-based components for modern websites." primary={{ label: 'Get started' }} secondary={{ label: 'Learn more' }} /></Demo>
      <Demo label="Form container">
        <div style={{ maxWidth: 480 }}>
          <FormContainer title="Contact us" description="We reply within one business day." submitLabel="Send">
            <Field label="Name" htmlFor="cn"><Input id="cn" name="name" /></Field>
            <Field label="Email" htmlFor="ce"><Input id="ce" name="email" type="email" /></Field>
            <Field label="Message" htmlFor="cm"><Textarea id="cm" name="msg" /></Field>
          </FormContainer>
        </div>
      </Demo>
      <Demo label="Feed / timeline"><Feed items={mock.feed} /></Demo>
      <Demo label="Social proof">
        <Stack gap={6}>
          <LogoStrip names={mock.logos} />
          <Testimonial {...mock.testimonials[slide]} />
          <Stack direction="row" gap={2}>{mock.testimonials.map((_, i) => <Button key={i} size="sm" variant={i === slide ? 'dark' : 'outline'} onClick={() => setSlide(i)}>{i + 1}</Button>)}</Stack>
        </Stack>
      </Demo>
      <Demo label="Video player (sample source)">
        <div style={{ maxWidth: 640 }}><VideoPlayer title="Product tour" src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" /></div>
      </Demo>
    </Section>
  )
}

const nav = [['forms', 'Forms'], ['navigation', 'Navigation'], ['containers', 'Containers'], ['feedback', 'Feedback'], ['charts', 'Charts'], ['sections', 'Page sections']]

export function App() {
  return (
    <ToastProvider>
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: '#fff', borderBottom: '2px solid #111' }}>
        <Container size="xl">
          <Stack direction="row" align="center" gap={6} style={{ height: 52 }}>
            <strong>Swiss React Components</strong>
            <nav style={{ display: 'flex', gap: 16, fontSize: 14, flexWrap: 'wrap' }}>{nav.map(([id, l]) => <a key={id} href={`#${id}`} style={{ color: 'inherit' }}>{l}</a>)}</nav>
          </Stack>
        </Container>
      </header>
      <Container size="xl">
        <FormsSection />
        <NavSection />
        <ContainersSection />
        <FeedbackSection />
        <ChartsSection />
        <PageSection />
      </Container>
    </ToastProvider>
  )
}
