import React from "react";
import { Button, ButtonProps } from "react-bootstrap";
import { ArrowRepeat } from "react-bootstrap-icons";
import { HandThumbsUpFill } from "react-bootstrap-icons";

type LoadingButtonProps = ButtonProps & {
  loading: boolean
};

function LoadingButton(props:LoadingButtonProps) {
  let {loading: loading} = props;
  let propsWithoutLoading = Object.assign({}, props);
  delete propsWithoutLoading["loading"]

  return (
    <Button {...propsWithoutLoading} 
      className={"loading-button " + (loading ? "loading" : "success")} 
      variant={loading ? "warning" : "success"}
    >
      {!!loading && 
        <ArrowRepeat className="white"/>
      }
      {!loading && 
        <HandThumbsUpFill className="white"/>
      }
    </Button>
  );
}

export default LoadingButton;