/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 * @format
 */

'use strict'

import { Platform, flattenStyle } from 'react-native-web-internals'

import NativeAnimatedHelper from '../NativeAnimatedHelper.js'
import AnimatedNode from './AnimatedNode.js'
import AnimatedTransform from './AnimatedTransform.js'
import AnimatedWithChildren from './AnimatedWithChildren.js'

function createAnimatedStyle(inputStyle) {
  // $FlowFixMe[underconstrained-implicit-instantiation]
  const style = flattenStyle(inputStyle)
  const animatedStyles = {}
  for (const key in style) {
    const value = style[key]
    if (key === 'transform') {
      animatedStyles[key] = new AnimatedTransform(value)
    } else if (value instanceof AnimatedNode) {
      animatedStyles[key] = value
    } else if (value && !Array.isArray(value) && typeof value === 'object') {
      animatedStyles[key] = createAnimatedStyle(value)
    }
  }
  return animatedStyles
}

function createStyleWithAnimatedTransform(inputStyle) {
  // $FlowFixMe[underconstrained-implicit-instantiation]
  let style = flattenStyle(inputStyle) || {}

  if (style.transform) {
    style = {
      ...style,
      transform: new AnimatedTransform(style.transform),
    }
  }
  return style
}

export default class AnimatedStyle extends AnimatedWithChildren {
  _inputStyle
  _style

  constructor(style) {
    super()
    // if (Platform.OS === 'web') {
    //   this._inputStyle = style
    //   this._style = createAnimatedStyle(style)
    // } else {
    this._style = createStyleWithAnimatedTransform(style)
    // }
  }

  // Recursively get values for nested styles (like iOS's shadowOffset)
  _walkStyleAndGetValues(style) {
    const updatedStyle = {}
    for (const key in style) {
      const value = style[key]
      if (value instanceof AnimatedNode) {
        updatedStyle[key] = value.__getValue()
      } else if (value && !Array.isArray(value) && typeof value === 'object') {
        // Support animating nested values (for example: shadowOffset.height)
        updatedStyle[key] = this._walkStyleAndGetValues(value)
      } else {
        updatedStyle[key] = value
      }
    }
    return updatedStyle
  }

  __getValue() {
    // if (Platform.OS === 'web') {
    //   return [this._inputStyle, this._walkStyleAndGetValues(this._style)]
    // }

    return this._walkStyleAndGetValues(this._style)
  }

  // Recursively get animated values for nested styles (like iOS's shadowOffset)
  _walkStyleAndGetAnimatedValues(style) {
    const updatedStyle = {}
    for (const key in style) {
      const value = style[key]
      if (value instanceof AnimatedNode) {
        updatedStyle[key] = value.__getAnimatedValue()
      } else if (value && !Array.isArray(value) && typeof value === 'object') {
        // Support animating nested values (for example: shadowOffset.height)
        updatedStyle[key] = this._walkStyleAndGetAnimatedValues(value)
      }
    }
    return updatedStyle
  }

  __getAnimatedValue() {
    return this._walkStyleAndGetAnimatedValues(this._style)
  }

  __attach() {
    for (const key in this._style) {
      const value = this._style[key]
      if (value instanceof AnimatedNode) {
        value.__addChild(this)
      }
    }
  }

  __detach() {
    for (const key in this._style) {
      const value = this._style[key]
      if (value instanceof AnimatedNode) {
        value.__removeChild(this)
      }
    }
    super.__detach()
  }

  __makeNative(platformConfig) {
    for (const key in this._style) {
      const value = this._style[key]
      if (value instanceof AnimatedNode) {
        value.__makeNative(platformConfig)
      }
    }
    super.__makeNative(platformConfig)
  }

  __getNativeConfig() {
    const styleConfig = {}
    for (const styleKey in this._style) {
      if (this._style[styleKey] instanceof AnimatedNode) {
        const style = this._style[styleKey]
        style.__makeNative(this.__getPlatformConfig())
        styleConfig[styleKey] = style.__getNativeTag()
      }
      // Non-animated styles are set using `setNativeProps`, no need
      // to pass those as a part of the node config
    }
    NativeAnimatedHelper.validateStyles(styleConfig)
    return {
      type: 'style',
      style: styleConfig,
    }
  }
}
