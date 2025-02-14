/*
 * Wire
 * Copyright (C) 2021 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

import React from 'react';
import {keyframes} from '@emotion/react';
import {registerReactComponent} from 'Util/ComponentUtil';
import SVGProvider from '../../auth/util/SVGProvider';
import {UserState} from '../../user/UserState';
import {container} from 'tsyringe';

const fadeAnimation = keyframes`
  0%   { opacity: 0.2; }
  100% { opacity: 1; }
`;

interface ParticipantMicOnIconProps {
  className?: string;
  color?: string;
  isActive?: boolean;
}

const ParticipantMicOnIcon: React.FC<ParticipantMicOnIconProps> = ({
  className,
  isActive = false,
  color = '#fff',
  ...props
}) => {
  const userState = container.resolve(UserState);
  return (
    <span
      css={{animation: isActive ? `${fadeAnimation} 0.7s steps(7) infinite alternate` : 'initial'}}
      className={className}
      {...props}
    >
      <svg
        data-uie-name="mic-icon-on"
        data-uie-active={isActive ? 'active' : 'inactive'}
        css={{
          '> path': {
            fill: isActive ? `${userState.self().accent_color()} !important` : color,
          },
          width: 16,
        }}
        viewBox="0 0 16 16"
        dangerouslySetInnerHTML={{__html: SVGProvider['mic-on-icon']?.documentElement?.innerHTML}}
      ></svg>
    </span>
  );
};

export default ParticipantMicOnIcon;

registerReactComponent('participant-mic-on-icon', ParticipantMicOnIcon);
