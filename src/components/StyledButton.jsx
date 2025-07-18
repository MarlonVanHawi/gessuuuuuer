import React from 'react';
import styled from 'styled-components';

const ButtonWrapper = styled.button`
  all: unset;
  box-sizing: border-box; /* Re-add for predictable sizing */
  font-family: inherit; /* Re-add for consistent font */
  text-align: center; /* Re-add for text alignment */
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 60px;
  background: transparent;
  border-radius: 12px;
  border: none;
  overflow: hidden;
  cursor: pointer;
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
  text-shadow: 0 1px 3px rgba(0,0,0,0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }

  .center {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .color-border {
    border-radius: 50%;
    background-color: #ffffff20;
    box-shadow: 0px 0px 10px 2px rgba(0, 0, 0, 0.1);
  }
  .circle-1 { height: 66px; width: 66px; position: absolute; right: -15px; top: -15px; z-index: 1; }
  .circle-2 { height: 54px; width: 54px; }
  .circle-3 { height: 42px; width: 42px; }
  .circle-4 { height: 31px; width: 31px; }
  .circle-5 { height: 21px; width: 21px; border-radius: 50%; background-color: #ffffff; }

  .shape {
    height: 60px;
    width: 60px;
    background-color: #484848;
    transform: rotate(45deg);
    position: absolute;
  }
  .shadow { box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.75); }
  .mountain-1 { z-index: 1; bottom: -30px; left: -30px; }
  .mountain-2 { bottom: -33px; left: -9px; }
  .mountain-3 { z-index: 2; bottom: -45px; left: 27px; }

  .btn-text {
    z-index: 10; /* Ensure text is on top */
  }
`;

const GradientLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.$gradient || 'linear-gradient(180deg, #ff0b00, #ff9e00)'};
  border-radius: 12px; /* Match parent */
  z-index: 0; /* Sit behind all other elements */
`;

const StyledButton = ({ children, gradient, ...props }) => {
  return (
    <ButtonWrapper {...props}>
      <GradientLayer $gradient={gradient} />
      <div className="circle-1 center color-border">
        <div className="circle-2 center color-border">
          <div className="circle-3 center color-border">
            <div className="circle-4 center color-border">
              <div className="circle-5" />
            </div>
          </div>
        </div>
      </div>
      <div className="mountain-1 shape shadow" />
      <div className="mountain-2 shape" />
      <div className="mountain-3 shape shadow" />
      <span className="btn-text">{children}</span>
    </ButtonWrapper>
  );
};

export default StyledButton;
