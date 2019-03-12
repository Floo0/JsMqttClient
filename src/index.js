// index.js
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Row, Col,
    Navbar,
    Nav, 
    Form, 
    FormControl, 
    Container, 
    Button,
    ButtonToolbar,
    InputGroup,
    Card,
 } from 'react-bootstrap';
 import Paho from './paho-mqtt.js'


 function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
  }


class App extends Component {
    constructor(props) {
        super(props)

        // this.handleConnect = this.handleConnect.bind(this)
        // this.handleHost = this.handleHost.bind(this)
        this.state = {
            connection: false,
            conn_state: "Disconnected",
            connect_btn: "Connect",
            host: "127.0.0.1",
            // host: "192.168.137.32",
            port: "9001",
            pub_topic: "data",
            sub_topic: "data",
            pub_qos: "0",
            sub_qos: "0",
            pub_msg: "test message to publish",
            sub_msg: "",
            rec_msg: "Nothing received",
            publication: "Publish",
            subscription: "Subscribe",
            subscribed: false,
            sub_btn: "Subscribe",
        }
    }

    componentDidMount() {
        console.log("componentDidMount");
      }

    componentDidUpdate() {
        console.log("componentDidUpdate");
    }

    componentWillUnmount() {
        console.log("componentWillUnmount");
     }

    //  handleOpenCloseNav() {
    //     console.log("handleOpenCloseNav");
    //     this.setState({
    //       hidden: !this.state.hidden,
    //     });
    //   }

    onConnect() {
        // console.log("onConnected", this.state);
        this.setState({connection: true, conn_state: "Connected", connect_btn: "Disconnect", failed: false})
    }
    onFailure(message) {
        console.log("Failed ", message);
        this.setState({conn_state: "Failed"})
    }
    onMessageArrived(r_message) {
        // console.log("onMessageArrived", r_message, this.state);
        // var msg = this.state.sub_msg;
        var msg_rec = "Received at: " + Date().toLocaleString().substring(0, 24);
        var msg = r_message.payloadString;
        this.setState({rec_msg: msg_rec, sub_msg: msg})
    }
    onConnectionLost(responseObject) {
        if (responseObject.errorCode !== 0) {
            console.log("onConnectionLost:", responseObject.errorCode, responseObject.errorMessage);
        }
        this.setState({connection: false, conn_state: "Connection Lost", connect_btn: "Connect"});
    }
    connect() {
        var host = this.state.host
        var port = parseInt(this.state.port)
        console.log("connecting to "+ host +" "+ port);

        this.mqtt = new Paho.Client(host,port,"");
        // var mqtt = new Paho.MQTT.Client(host,port,"client5");
        var options = {
            timeout: 3,
            onSuccess: this.onConnect.bind(this),
            onFailure: this.onFailure.bind(this),
        
        };
        
        this.mqtt.onConnectionLost = this.onConnectionLost.bind(this);
        this.mqtt.onMessageArrived = this.onMessageArrived.bind(this);
        // mqtt.onConnected = onConnected;
        
        this.mqtt.connect(options);
    }


    handleConnect() {
        // console.log("handleConnect", this.state);

        if (this.state.connection) {
            this.mqtt.disconnect()
            this.setState({connection: false, conn_state: "Disconnected", connect_btn: "Connect"})
        } else {
            this.setState({conn_state: "Connecting"})
            this.connect()
        }
    }

    handlePublish() {
        // console.log("handlePublish", this.state);
        if (!this.state.connection){
            this.handleConnect()
        } else {
            this.setState({publication: "Publishing"})
            var message = new Paho.Message(this.state.pub_msg);
            message.destinationName = this.state.pub_topic;
            this.mqtt.send(message);
            this.setState({publication: "Published"})
        }
    }

    onSubscriptionFailure(responseObject) {
        // console.log("onSubscriptionFailure", responseObject)
        if (responseObject.errorCode !== 0) {
            console.log("onSubscriptionFailure:", responseObject.errorCode, responseObject.errorMessage);
        }
        this.setState({subscription: "Subscription failed"})
    }

    handleSubscribe() {
        // console.log("handleSubscribe", this.state);
        if (!this.state.connection){
            this.handleConnect();
        } else {
            if (!this.state.subscribed){
                this.setState({subscription: "Subscribing"})
                var options={
                    qos: parseInt(this.state.sub_qos),
                    onSuccess: () => this.setState({subscription: "Subscribed to topic \"" + this.state.sub_topic + "\"", subscribed: true, sub_btn: "Unsubscribe"}),
                    onFailure: this.onSubscriptionFailure.bind(this),
                    };
                this.mqtt.subscribe(this.state.sub_topic, options);
                // this.setState({subscription: "Subscribed to topic \"" + this.state.sub_topic + "\"", subscribed: true, sub_btn: "Unsubscribe"})
            } else {
                var options={
                    onSuccess: () => this.setState({subscription: "Unsubscribed", subscribed: false, sub_btn: "Subscribe"}),
                };
                this.mqtt.unsubscribe(this.state.sub_topic, options)
            }
        }
    }


     render() {

        return (
          <div>
            <Navbar bg="dark" variant="dark">
              <Navbar.Brand href="#home">MQTT</Navbar.Brand>
                <Nav className="mr-auto">
                {/* <Nav.Link href="#home">Home</Nav.Link>
                <Nav.Link href="#features">Features</Nav.Link>
                <Nav.Link href="#pricing">Bugs</Nav.Link> */}
                </Nav>
                {/* <Form inline>
                <FormControl type="text" placeholder="Search" className="mr-sm-2" />
                <Button variant="outline-info">Search</Button>
                </Form> */}
            </Navbar>
            <Container fluid>

            {/* ####### Connection ####### */}
            <Card className="mt-3">
                <Card.Header>Connection - State: {this.state.conn_state}</Card.Header>
                <Card.Body>
                    <Row>
                        <Col>
                            <label htmlFor="basic-url">Host IP-Address</label>
                            <InputGroup className="mb-3">
                                <FormControl id="host" value={this.state.host} onChange={() => this.setState({host: event.target.value})}/>
                            </InputGroup>
                        </Col>
                        <Col>
                            <label htmlFor="basic-url">Port</label>
                            <InputGroup className="mb-3">
                                <FormControl id="port" value={this.state.port} onChange={() => this.setState({port: event.target.value})}/>
                            </InputGroup>
                        </Col>
                        <Col>
                            <label htmlFor="basic-url"><br></br></label>
                            <ButtonToolbar>
                                <Button variant="dark" onClick={this.handleConnect.bind(this)}>{this.state.connect_btn}</Button>
                            </ButtonToolbar>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* ####### Publish ####### */}
            <Card className="mt-2">
                <Card.Header>Transmission - {this.state.publication} {this.state.connection ? "" : "(Not Connected)"}</Card.Header>
                <Card.Body>
                    <Row>
                        <Col sm={3}>
                            <Form.Group controlId="exampleForm.ControlTextarea1">
                                <Form.Label>Topic</Form.Label>
                                <Form.Control value={this.state.pub_topic} onChange={() => this.setState({pub_topic: event.target.value})}/>
                            </Form.Group>
                            <Form.Group controlId="exampleForm.ControlTextarea1">
                                <Form.Label>QoS</Form.Label>
                                <Form.Control  value={this.state.pub_qos} onChange={() => this.setState({pub_qos: event.target.value})} as="select">
                                    <option>0</option>
                                    <option>1</option>
                                    <option>2</option>
                                </Form.Control>
                            </Form.Group>
                            <label htmlFor="basic-url"><br></br></label>
                            <ButtonToolbar>
                                <Button variant="dark" onClick={this.handlePublish.bind(this)}>Publish</Button>
                            </ButtonToolbar>
                        </Col>
                        <Col>
                            <Form.Group controlId="exampleForm.ControlTextarea1">
                                <Form.Label>Message</Form.Label>
                                <Form.Control as="textarea" style={{height: "210px"}} value={this.state.pub_msg} onChange={() => this.setState({pub_msg: event.target.value})}/>
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* ####### Subscribe ####### */}
            <Card className="mt-2">
                <Card.Header>Transmission - {this.state.subscription} {this.state.connection ? "" : "(Not Connected)"}</Card.Header>
                <Card.Body>
                    <Row> 
                        <Col sm={3}>
                            <Form.Group controlId="exampleForm.ControlTextarea1">
                                <Form.Label>Topic</Form.Label>
                                <Form.Control value={this.state.sub_topic} onChange={() => this.setState({sub_topic: event.target.value})}/>
                            </Form.Group>
                            <Form.Group controlId="exampleForm.ControlTextarea1">
                                <Form.Label>QoS</Form.Label>
                                <Form.Control  value={this.state.sub_qos} onChange={() => this.setState({sub_qos: event.target.value})} as="select">
                                    <option>0</option>
                                    <option>1</option>
                                    <option>2</option>
                                </Form.Control>
                            </Form.Group>
                            <label htmlFor="basic-url"><br></br></label>
                            <ButtonToolbar>
                                <Button variant="dark" onClick={this.handleSubscribe.bind(this)}>{this.state.sub_btn}</Button>
                            </ButtonToolbar>
                        </Col>
                        <Col>
                            <Form.Group controlId="exampleForm.ControlTextarea1">
                                <Form.Label>{this.state.rec_msg}</Form.Label>
                                <Form.Control as="textarea"  style={{height: "210px"}}  value={this.state.sub_msg} onChange={() => {}}/>
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
          </Container>
          </div>
        );
      }
}

ReactDOM.render(
    <App />,
    document.getElementById('app')
);