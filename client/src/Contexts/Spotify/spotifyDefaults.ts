import { TypedEmitter } from 'tiny-typed-emitter';
import { SpotifyLoginToken } from '../../../../shared/SpotifyTokens';
import ServerErrorResponse from '../../types/ServerErrorResponse';
import { SpotifyControllers, ISpotifyContext, SpotifyEvents } from './SpotifyTypes';

export const defaultSpotifyControllers: SpotifyControllers = {
    requestLogin: function (authorizationCode: string, redirectUri: string): Promise<true | ServerErrorResponse> {
        throw new Error('Function not implemented.');
    },
    requestRefresh: function (currentData: SpotifyLoginToken & { setAt: string }): Promise<true | ServerErrorResponse> {
        throw new Error('Function not implemented.');
    },
    logout: function (): void {
        throw new Error('Function not implemented.');
    },
};

export const defaultSpotifyContext: ISpotifyContext = {
    spotify: null,
    controllers: defaultSpotifyControllers,
    events: new TypedEmitter<SpotifyEvents>(),
};
