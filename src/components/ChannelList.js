import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { ChannelPreviewLastMessage } from './ChannelPreviewLastMessage';
import { LoadingIndicator } from './LoadingIndicator';
import { withChatContext } from '../context';
import { ChannelListTeam } from './ChannelListTeam';
import { isPromise } from '../utils';

/**
 * ChannelList - A preview list of channels, allowing you to select the channel you want to open
 * @extends PureComponent
 * @example ./docs/ChannelList.md
 */

class ChannelList extends PureComponent {
  static propTypes = {
    /** Channels can be either an array of channels or a promise which resolves to an array of channels */
    channels: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.objectOf({
        then: PropTypes.func,
      }),
      PropTypes.object,
    ]).isRequired,
    /** The Preview to use, defaults to ChannelPreviewLastMessage */
    Preview: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),

    /** The loading indicator to use */
    LoadingIndicator: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    List: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  };

  static defaultProps = {
    Preview: ChannelPreviewLastMessage,
    LoadingIndicator,
    List: ChannelListTeam,
  };

  constructor(props) {
    super(props);
    this.state = { error: false, loading: true, channels: [] };

    this.menuButton = React.createRef();
  }

  async componentDidMount() {
    try {
      let channelQueryResponse = this.props.channels;
      if (isPromise(channelQueryResponse)) {
        channelQueryResponse = await this.props.channels;
        if (channelQueryResponse.length >= 1) {
          this.props.setActiveChannel(channelQueryResponse[0]);
        }
      }
      this.setState({ loading: false, channels: channelQueryResponse });
    } catch (e) {
      console.log(e);
      this.setState({ error: true });
    }
  }

  static getDerivedStateFromError() {
    return { error: true };
  }

  componentDidCatch(error, info) {
    console.warn(error, info);
  }

  clickCreateChannel = (e) => {
    this.props.setChannelStart();
    e.target.blur();
  };

  closeMenu = () => {
    this.menuButton.current.checked = false;
  };

  render() {
    const context = {
      clickCreateChannel: this.clickCreateChannel,
      closeMenu: this.closeMenu,
    };
    const List = this.props.List;
    return (
      <React.Fragment>
        <input
          type="checkbox"
          id="str-chat-channel-checkbox"
          ref={this.menuButton}
          className="str-chat-channel-checkbox"
        />
        <label
          htmlFor="str-chat-channel-checkbox"
          className="str-chat-channel-list-burger"
        >
          <div />
        </label>
        <div
          className={`str-chat str-chat-channel-list ${this.props.theme} ${
            this.props.open ? 'str-chat-channel-list--open' : ''
          }`}
          ref={this.channelList}
        >
          <List {...this.props} {...this.state} {...context} />
        </div>
      </React.Fragment>
    );
  }
}

ChannelList = withChatContext(ChannelList);
export { ChannelList };
