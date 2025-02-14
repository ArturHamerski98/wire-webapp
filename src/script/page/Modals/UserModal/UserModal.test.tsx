/*
 * Wire
 * Copyright (C) 2022 Wire Swiss GmbH
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

import {QualifiedId} from '@wireapp/api-client/src/user';

import TestPage from 'Util/test/TestPage';
import {UserState} from 'src/script/user/UserState';
import {TeamState} from 'src/script/team/TeamState';
import {Core} from 'src/script/service/CoreSingleton';
import UserModal, {UserModalProps} from './UserModal';
import {UserRepository} from 'src/script/user/UserRepository';
import {ActionsViewModel} from 'src/script/view_model/ActionsViewModel';
import {User} from 'src/script/entity/User';

class UserModalPage extends TestPage<UserModalProps> {
  constructor(props?: UserModalProps) {
    super(UserModal, props);
  }

  getWrapperElement = () => this.get('div.user-modal');
  getStatusModalText = () => this.findByTestId('status-modal-text');
}

describe('UserModal', () => {
  it('does not render when user id is not passed', async () => {
    const UserModal = new UserModalPage({
      actionsViewModel: {} as ActionsViewModel,
      core: {} as Core,
      teamState: {} as TeamState,
      userId: null,
      userRepository: {} as UserRepository,
      userState: {} as UserState,
    });
    expect(UserModal.getWrapperElement().children[0].getAttribute('style')).toBe('display: none;');
  });

  it('correctly fetches user from user repository', async () => {
    jest.useFakeTimers();
    const getUserById = jest.fn(async (id: QualifiedId) => {
      return new User('mock-id', 'test-domain.mock');
    });
    new UserModalPage({
      actionsViewModel: {} as ActionsViewModel,
      core: {} as Core,
      teamState: {} as TeamState,
      userId: {domain: 'test-domain.mock', id: 'mock-id'},
      userRepository: {
        getUserById,
      } as unknown as UserRepository,
      userState: {} as UserState,
    });
    expect(getUserById).toBeCalledTimes(1);
  });

  it('shows user not found when user is deleted', async () => {
    jest.useFakeTimers();
    const getUserById = jest.fn(async (id: QualifiedId) => {
      const user = new User('mock-id', 'test-domain.mock');
      user.isDeleted = true;
      return user;
    });
    const UserModal = new UserModalPage({
      actionsViewModel: {} as ActionsViewModel,
      core: {} as Core,
      teamState: {} as TeamState,
      userId: {domain: 'test-domain.mock', id: 'mock-id'},
      userRepository: {
        getUserById,
      } as unknown as UserRepository,
      userState: {} as UserState,
    });
    expect(getUserById).toBeCalledTimes(1);
    const statusModalText = await UserModal.getStatusModalText();
    expect(statusModalText).toBeInstanceOf(HTMLDivElement);
  });
});
