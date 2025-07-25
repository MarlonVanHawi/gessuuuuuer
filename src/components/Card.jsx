import React from 'react';
import styled from 'styled-components';

const Card = ({ title, children }) => {
  return (
    <StyledWrapper>
      <div className="card">
        <div className="content">
          <p className="heading">{title}</p>
          <div className="card-body">
            {children}
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .card {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 320px;
    padding: 2px;
    border-radius: 24px;
    overflow: hidden;
    line-height: 1.6;
    transition: all 0.48s cubic-bezier(0.23, 1, 0.32, 1);
    color: #ffffff; /* Set default text color to white */
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
    padding: 34px;
    border-radius: 22px;
    background: #1a1a1a; /* Dark background for content */
    transition: all 0.48s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .content .heading {
    font-weight: 700;
    font-size: 36px;
    line-height: 1.3;
    z-index: 1;
    transition: all 0.48s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .content .card-body {
    z-index: 1;
    opacity: 0.9;
    font-size: 18px;
    transition: all 0.48s cubic-bezier(0.23, 1, 0.32, 1);
    width: 100%;
  }

  .card::before {
    content: "";
    position: absolute;
    height: 160%;
    width: 160%;
    border-radius: inherit;
    background: linear-gradient(to right, #0a3cff, #4a90e2);
    transform-origin: center;
    animation: moving 4.8s linear infinite paused;
    transition: all 0.88s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .card:hover::before {
    animation-play-state: running;
    z-index: -1;
    width: 20%;
  }

  .card:hover .content {
      background: #ffffff;
  }

  .card:hover .content .heading,
  .card:hover .content .card-body {
    color: #000000;
  }

  .card:hover {
    box-shadow: 0rem 6px 13px rgba(10, 60, 255, 0.1),
      0rem 24px 24px rgba(10, 60, 255, 0.09),
      0rem 55px 33px rgba(10, 60, 255, 0.05),
      0rem 97px 39px rgba(10, 60, 255, 0.01), 0rem 152px 43px rgba(10, 60, 255, 0);
    scale: 1.05;
  }

  @keyframes moving {
    0% {
      transform: rotate(0);
    }

    100% {
      transform: rotate(360deg);
    }
  }
`;

export default Card;
