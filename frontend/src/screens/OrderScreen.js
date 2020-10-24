import React, { useState, useEffect } from "react";
import axios from "axios";
import { PayPalButton } from "react-paypal-button-v2";
import { Link } from "react-router-dom";
import { Row, Col, ListGroup, Image, Card, Button, Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { getOrderDetails, payOrder, shipOrder } from "../actions/orderActions";
import { CART_RESET } from '../constants/cartConstants'

//Without this, you will get an infinite loop after order is placed
import { ORDER_PAY_RESET, ORDER_DELIVER_RESET } from '../constants/orderConstants'

const OrderScreen = ({ match, history }) => {
  const dispatch = useDispatch();

  const [sdkReady, setSdkReady] = useState(false);



  const orderId = match.params.id;

  const orderDetails = useSelector((state) => state.orderDetails);
  const { order, loading, error } = orderDetails;

  
  // const { trackingInfo } = order;
  // const [trackingInfo, setTrackingInfo] = useState(order.trackingInfo)
  const [trackingInfo, setTrackingInfo] = useState('')

  const orderPay = useSelector((state) => state.orderPay);
  const { loading: loadingPay, success: successPay } = orderPay;

  const orderShip = useSelector((state) => state.orderShip);
  const { loading: loadingShip, success: successShip } = orderShip;

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  
  
  useEffect(() => {

    if(!userInfo) {
      history.push('/login')
    }

    //Adds PayPal Script after page is loaded
    const addPayPalScript = async () => {
      const { data: clientId } = await axios.get("/api/config/paypal");
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`;
      script.async = true;
      script.onload = () => {
        setSdkReady(true);
      };
      document.body.appendChild(script);
    };


    if (!order || successPay || order._id !== orderId || successShip) {
        //This prevents infinte loop after payment is made
        dispatch({ type: ORDER_PAY_RESET })
        dispatch({ type: ORDER_DELIVER_RESET })
        
        dispatch(getOrderDetails(orderId));
    } else if (!order.isPaid) {
      if (!window.paypal) {
        addPayPalScript();
      } else {
        setSdkReady(true);
      }
    }
  }, [dispatch, order, orderId, successPay, successShip]);

  if (!loading) {
    //Used to add decimal to total
    const addDecimals = (num) => {
      return (Math.round(num * 100) / 100).toFixed(2);
    };
    //calculate prices
    order.itemsPrice = addDecimals(
      order.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0)
    );
  }

  const successPaymentHandler = (paymentResult) => {
    dispatch({ type: CART_RESET })
    dispatch(payOrder(orderId, paymentResult))
  }

  
  const shippedHandler = (e) => {
    dispatch({ type: CART_RESET })
    dispatch(shipOrder(order, trackingInfo))
  }

  return loading ? (
    <Loader />
  ) : error ? (
    <Message variant="danger">{error}</Message>
  ) : (
    <>
      <h1>Order {order.isPaid && order._id}</h1>
      <Row>
        <Col md={8}>
          <ListGroup variant>
            <ListGroup.Item>
              <h2>Shipping</h2>
              <p>
                <strong>Name: </strong>
                {order.user.name}
              </p>
              <p>
                <strong>Email: </strong>
                <a href={`mailto:${order.user.email}`}>{order.user.email}</a>
              </p>
              <p>
                <strong>Address: </strong>
                {order.shippingAddress.address},{order.shippingAddress.city}{" "}
                {order.shippingAddress.postalCode},{" "}
                {order.shippingAddress.country}
              </p>
              {order.isShipped ? (
                <Message variant="success">
                  Your order shipped on: {order.shippedAt.substring(0,10)}
                  <br></br>Tracking info: {order.trackingInfo}
                  {/* tracking: Add tracking from schema */}
                </Message>
              ) : (
                <Message variant="danger">Not shipped</Message>
              )}
              {loadingShip && <Loader />}
              { userInfo &&
                userInfo.isAdmin &&
                order.isPaid &&
                !order.isShipped && (
                <ListGroup.Item >
                <Form>
                <Form.Group>
                <Form.Label>Tracking Number</Form.Label>
                    <Form.Control
                        type='text'
                        placeholder='Enter Tracking Number'
                        value={trackingInfo}
                        required
                        onChange={(e) => setTrackingInfo(e.target.value)}
                        // onChange={this.value = order.trackingInfo}
                        >
                        
                        </Form.Control>
                        </Form.Group>
                  <Button type='button' className='btn btn-block' onClick={shippedHandler}>
                    Mark As Shipped
                  </Button>
                  
                </Form>
              
                </ListGroup.Item>
              )}
            </ListGroup.Item>
            <ListGroup.Item>
              <h2>Payment Method: </h2>
              <p>
                <strong>Method: </strong>
                {order.paymentMethod}
              </p>
              {order.isPaid ? (
                <Message variant="success">
                  Payment processed on: {order.paidAt.substring(0, 10)}
                </Message>
              ) : (
                <Message variant="danger">
                  Payment has not been processed
                </Message>
              )}
            </ListGroup.Item>
            <ListGroup.Item>
              <h2>Order Items: </h2>
              {order.orderItems.length === 0 ? (
                <Message>Order is empty</Message>
              ) : (
                <ListGroup variant="flush">
                  {order.orderItems.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row>
                        <Col md={1}>
                          <Image
                            src={item.image}
                            alt={item.name}
                            fluid
                            rounded
                          />
                        </Col>
                        <Col>
                          <Link to={`/product/${item.product}`}>
                            {item.name}
                          </Link>
                        </Col>
                        <Col md={4}>
                          {item.qty} x ${item.price} = $
                          {Number(item.qty * item.price).toFixed(2)}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4}>
          <Card>
            <ListGroup>
              <ListGroup.Item>
                <h2>Order Summery</h2>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Items</Col>
                  <Col>${order.itemsPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Shipping</Col>
                  <Col>${order.shippingPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Tax</Col>
                  <Col>${order.taxPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Total</Col>
                  <Col>${order.totalPrice}</Col>
                </Row>
              </ListGroup.Item>
              {!order.isPaid && (
                <ListGroup.Item>
                  {loadingPay && <Loader />}
                  {!sdkReady ? (
                    <Loader />
                  ) : (
                    <PayPalButton
                      amount={order.totalPrice}
                      onSuccess={successPaymentHandler}
                    />
                  )}
                </ListGroup.Item>
              )}
              {/* {loadingShip && <Loader />}
              { userInfo &&
                userInfo.isAdmin &&
                order.isPaid &&
                !order.isShipped && (
                <ListGroup.Item controlId='trackingInfo'>
                <Form.Label>Tracking Number</Form.Label>
                    <Form.Control
                        type='text'
                        placeholder='Enter Tracking Number'
                        value={trackingInfo}
                        required
                        onChange={(e) => setTrackingInfo(e.target.value)}>
                        </Form.Control>
                  <Button type='button' className='btn btn-block' onClick={shippedHandler}>
                    Mark As Shipped
                  </Button>
                </ListGroup.Item>
              )} */}

            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default OrderScreen;
