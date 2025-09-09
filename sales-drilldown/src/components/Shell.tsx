"use client";
import { Navbar, Container, Nav, Button, Offcanvas, Form } from "react-bootstrap";
import { useState } from "react";

export default function Shell({ children }: { children: React.ReactNode }){
  const [show, setShow] = useState(false);
  return (
    <>
      <Navbar bg="white" className="shadow-sm" expand="lg">
        <Container fluid>
          <Navbar.Brand href="#"><b>Pro Sales Dashboard</b></Navbar.Brand>
          <Nav className="ms-auto align-items-center gap-2">
            <Button size="sm" variant="outline-secondary" onClick={()=>setShow(true)}>
              <i className="bi bi-sliders"/> Filters
            </Button>
          </Nav>
        </Container>
      </Navbar>

      <Offcanvas show={show} onHide={()=>setShow(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Filters & Presets</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form className="vstack gap-3">
            <Form.Group>
              <Form.Label>Search Metrics</Form.Label>
              <Form.Control placeholder="Search…" />
            </Form.Group>
            <Form.Group>
              <Form.Label>Preset</Form.Label>
              <Form.Select>
                <option>Executive Overview</option>
                <option>Growth & Churn</option>
                <option>Monetization</option>
              </Form.Select>
            </Form.Group>
            <Button variant="primary" onClick={()=>setShow(false)}>Apply</Button>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>

      <Container fluid className="py-3">{children}</Container>
    </>
  );
}
