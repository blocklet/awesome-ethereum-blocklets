import { useState } from 'react';
import PropTypes from 'prop-types';
import { Typography, Box, Card, CardContent, CardMedia, Divider, Tooltip } from '@mui/material';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

function NFTIntro({
  isMobile,
  name,
  description,
  price,
  startTime,
  endTime,
  contractAddress,
  chainInfo,
  display,
  actions,
}) {
  const { t } = useLocaleContext();
  const [isLoaded, setIsLoaded] = useState(false);
  const renderList = [
    {
      title: t('common.chain'),
      content: chainInfo,
    },

    {
      title: t('common.price'),
      content: price,
    },
    {
      title: t('common.contractAddress'),
      content: contractAddress,
    },
    {
      title: t('common.startTime'),
      content: startTime,
    },
    {
      title: t('common.endTime'),
      content: endTime,
    },
  ];

  const width = isMobile ? '80vw' : 400;
  const height = isMobile ? '60vw' : '100%';

  return (
    <Card>
      <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
        <Box sx={{ width }}>
          <CardMedia
            component="img"
            key="nft"
            className={!isLoaded ? 'loading' : ''}
            sx={{ height }}
            image={display}
            title={name}
            onLoad={() => {
              setIsLoaded(true);
            }}
          />
        </Box>
        <Box sx={{ flexGrow: 1, width }}>
          <CardContent
            sx={{
              padding: '16px !important',
            }}>
            {/* name */}
            <Typography
              variant="h5"
              component="div"
              sx={{
                textAlign: 'center',
                fontWeight: 'bold',
              }}>
              {name}
            </Typography>
            {/* description */}
            <Typography variant="body2" color="text.secondary">
              <Box
                sx={{
                  textAlign: 'left',
                }}>
                <FormatQuoteIcon
                  fontSize="small"
                  sx={{
                    transform: 'rotate(180deg)',
                    marginBottom: -2,
                  }}
                />
              </Box>
              <Tooltip
                title={
                  <Box
                    sx={{
                      whiteSpace: 'pre-wrap',
                    }}>
                    {description}
                  </Box>
                }>
                <Box
                  sx={{
                    whiteSpace: 'pre-wrap',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    padding: '0 24px',
                  }}>
                  {description}
                </Box>
              </Tooltip>
              <Box
                sx={{
                  textAlign: 'right',
                  marginTop: -2,
                }}>
                <FormatQuoteIcon fontSize="small" />
              </Box>
            </Typography>
            {/* divider */}
            <Divider
              sx={{
                marginTop: 2,
                marginBottom: 2,
              }}
            />
            {renderList.map((item) => {
              const { title, content } = item;
              return (
                <Box key={title} className="flex items-center justify-between w-full mb-3 h-24px">
                  <Typography
                    variant="body2"
                    color="text"
                    sx={{
                      fontWeight: 'bold',
                      mr: 2,
                    }}>
                    {title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text"
                    sx={{
                      textAlign: 'right',
                    }}>
                    {content}
                  </Typography>
                </Box>
              );
            })}
            {/* divider */}
            <Divider
              sx={{
                marginTop: 2,
                marginBottom: 2,
              }}
            />
            {actions}
          </CardContent>
        </Box>
      </Box>
    </Card>
  );
}

NFTIntro.propTypes = {
  isMobile: PropTypes.bool,
  name: PropTypes.string,
  description: PropTypes.string,
  price: PropTypes.string,
  startTime: PropTypes.string,
  endTime: PropTypes.string,
  contractAddress: PropTypes.any,
  chainInfo: PropTypes.any,
  display: PropTypes.string,
  actions: PropTypes.array,
};

NFTIntro.defaultProps = {
  isMobile: false,
  name: '',
  description: '',
  price: '',
  startTime: '',
  endTime: '',
  contractAddress: null,
  chainInfo: null,
  display: '',
  actions: [],
};

export default NFTIntro;
