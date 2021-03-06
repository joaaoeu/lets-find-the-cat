import styled from 'styled-components';
import { colors, fontSizes } from '../../styles';

export const Container = styled.footer`
  text-align: center;
  color: ${colors.primary};
  padding: 20px;
`;

export const Copyright = styled.p`
  font-size: ${fontSizes.small};
  font-weight: bold;
`;

export const SocialMedia = styled.div`
  margin-top: 10px;

  a {
    margin: 0 10px;
    color: ${colors.primary};
    transition: .5s;

    &:hover {
      color: ${colors.secondary};
    }
  }
`;
