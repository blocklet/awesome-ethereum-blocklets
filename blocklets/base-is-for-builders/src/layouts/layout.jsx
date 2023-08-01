import { useEffect } from 'react';
import PropTypes from 'prop-types';
import Header from '@blocklet/ui-react/lib/Header';
import Footer from '@blocklet/ui-react/lib/Footer';
import { styled } from '@arcblock/ux/lib/Theme';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { Outlet } from 'react-router-dom';
// import ConnectButton from '@arcblock/did-connect/lib/Button';
import { useSessionContext } from '../contexts/session';

function Layout({ children }) {
  const { session } = useSessionContext();

  useEffect(() => {
    if (!session.user) {
      // session.login();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.user]);

  return (
    <Root>
      <Header
        logo={
          null
          // <img
          //   src="https://new.arcblock.io/blog/uploads/1671422131542-0dDNjXhEl_1yBIm8h7vC-Gnm.png"
          //   alt="logo"
          //   style={{ height: 44 }}
          // />
        }
        className="layout-header"
        maxWidth={false}
      />
      <Container className="layout-container">
        <Box className="h-full" pt={2}>
          {children || <Outlet />}
        </Box>
        {/* {session.user || true ? (
          <Box className="h-full" pt={2}>
            {children || <Outlet />}
          </Box>
        ) : (
          <ConnectButton
            color="primary"
            onClick={session.login}
            style={{
              height: 'fit-content',
              width: 'fit-content',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              right: 0,
              margin: 'auto',
            }}
          />
        )} */}
      </Container>
      <Footer className="layout-footer" />
    </Root>
  );
}

Layout.propTypes = {
  children: PropTypes.any,
};

Layout.defaultProps = {
  children: null,
};

export default Layout;

const Root = styled(Box)`
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  .layout-header {
    position: relative;
    top: 0;
    // border-bottom: 1px solid #eee;
    background-color: unset;
  }
  .layout-footer {
    margin-top: 16px;
    border-top: unset;
    color: #fff;
  }
  .layout-main {
    padding: 24px 0;
  }
  .layout-main-full-height {
    /* TODO: 内部元素如果 height 过大, 会撑大 main 容器元素 */
    height: 100%;
  }
  background-image: conic-gradient(
    from 90.001deg at 50% 50%,
    #0052ff 0deg,
    #ffffff 360deg,
    rgba(255, 255, 255, 0) 360deg
  );
`;
