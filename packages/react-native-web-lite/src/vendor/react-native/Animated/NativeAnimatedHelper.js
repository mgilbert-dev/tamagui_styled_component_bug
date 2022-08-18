import { invariant } from '../../../modules/invariant.js'
import NativeEventEmitter from '../NativeEventEmitter/index.js'
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 * @format
 */
import NativeAnimatedNonTurboModule from './NativeAnimatedModule.js'
import NativeAnimatedTurboModule from './NativeAnimatedTurboModule.js'

var NativeAnimatedModule = NativeAnimatedNonTurboModule
var __nativeAnimatedNodeTagCount = 1
/* used for animated nodes */

var __nativeAnimationIdCount = 1
/* used for started animations */

var nativeEventEmitter
var waitingForQueuedOperations = new Set()
var queueOperations = false
var queue = []
/**
 * Simple wrappers around NativeAnimatedModule to provide flow and autocomplete support for
 * the native module methods
 */

var API = {
  getValue: function getValue(tag, saveValueCallback) {
    invariant(NativeAnimatedModule, 'Native animated module is not available')

    if (NativeAnimatedModule.getValue) {
      NativeAnimatedModule.getValue(tag, saveValueCallback)
    }
  },
  setWaitingForIdentifier: function setWaitingForIdentifier(id) {
    waitingForQueuedOperations.add(id)
    queueOperations = true
  },
  unsetWaitingForIdentifier: function unsetWaitingForIdentifier(id) {
    waitingForQueuedOperations.delete(id)

    if (waitingForQueuedOperations.size === 0) {
      queueOperations = false
      API.disableQueue()
    }
  },
  disableQueue: function disableQueue() {
    invariant(NativeAnimatedModule, 'Native animated module is not available')

    for (var q = 0, l = queue.length; q < l; q++) {
      queue[q]()
    }

    queue.length = 0
  },
  queueOperation: (fn) => {
    if (queueOperations) {
      queue.push(fn)
    } else {
      fn()
    }
  },
  createAnimatedNode: function createAnimatedNode(tag, config) {
    invariant(NativeAnimatedModule, 'Native animated module is not available')
    API.queueOperation(() => NativeAnimatedModule.createAnimatedNode(tag, config))
  },
  startListeningToAnimatedNodeValue: function startListeningToAnimatedNodeValue(tag) {
    invariant(NativeAnimatedModule, 'Native animated module is not available')
    API.queueOperation(() => NativeAnimatedModule.startListeningToAnimatedNodeValue(tag))
  },
  stopListeningToAnimatedNodeValue: function stopListeningToAnimatedNodeValue(tag) {
    invariant(NativeAnimatedModule, 'Native animated module is not available')
    API.queueOperation(() => NativeAnimatedModule.stopListeningToAnimatedNodeValue(tag))
  },
  connectAnimatedNodes: function connectAnimatedNodes(parentTag, childTag) {
    invariant(NativeAnimatedModule, 'Native animated module is not available')
    API.queueOperation(() => NativeAnimatedModule.connectAnimatedNodes(parentTag, childTag))
  },
  disconnectAnimatedNodes: function disconnectAnimatedNodes(parentTag, childTag) {
    invariant(NativeAnimatedModule, 'Native animated module is not available')
    API.queueOperation(() => NativeAnimatedModule.disconnectAnimatedNodes(parentTag, childTag))
  },
  startAnimatingNode: function startAnimatingNode(animationId, nodeTag, config, endCallback) {
    invariant(NativeAnimatedModule, 'Native animated module is not available')
    API.queueOperation(() =>
      NativeAnimatedModule.startAnimatingNode(animationId, nodeTag, config, endCallback)
    )
  },
  stopAnimation: function stopAnimation(animationId) {
    invariant(NativeAnimatedModule, 'Native animated module is not available')
    API.queueOperation(() => NativeAnimatedModule.stopAnimation(animationId))
  },
  setAnimatedNodeValue: function setAnimatedNodeValue(nodeTag, value) {
    invariant(NativeAnimatedModule, 'Native animated module is not available')
    API.queueOperation(() => NativeAnimatedModule.setAnimatedNodeValue(nodeTag, value))
  },
  setAnimatedNodeOffset: function setAnimatedNodeOffset(nodeTag, offset) {
    invariant(NativeAnimatedModule, 'Native animated module is not available')
    API.queueOperation(() => NativeAnimatedModule.setAnimatedNodeOffset(nodeTag, offset))
  },
  flattenAnimatedNodeOffset: function flattenAnimatedNodeOffset(nodeTag) {
    invariant(NativeAnimatedModule, 'Native animated module is not available')
    API.queueOperation(() => NativeAnimatedModule.flattenAnimatedNodeOffset(nodeTag))
  },
  extractAnimatedNodeOffset: function extractAnimatedNodeOffset(nodeTag) {
    invariant(NativeAnimatedModule, 'Native animated module is not available')
    API.queueOperation(() => NativeAnimatedModule.extractAnimatedNodeOffset(nodeTag))
  },
  connectAnimatedNodeToView: function connectAnimatedNodeToView(nodeTag, viewTag) {
    invariant(NativeAnimatedModule, 'Native animated module is not available')
    API.queueOperation(() => NativeAnimatedModule.connectAnimatedNodeToView(nodeTag, viewTag))
  },
  disconnectAnimatedNodeFromView: function disconnectAnimatedNodeFromView(nodeTag, viewTag) {
    invariant(NativeAnimatedModule, 'Native animated module is not available')
    API.queueOperation(() => NativeAnimatedModule.disconnectAnimatedNodeFromView(nodeTag, viewTag))
  },
  restoreDefaultValues: function restoreDefaultValues(nodeTag) {
    invariant(NativeAnimatedModule, 'Native animated module is not available') // Backwards compat with older native runtimes, can be removed later.

    if (NativeAnimatedModule.restoreDefaultValues != null) {
      API.queueOperation(() => NativeAnimatedModule.restoreDefaultValues(nodeTag))
    }
  },
  dropAnimatedNode: function dropAnimatedNode(tag) {
    invariant(NativeAnimatedModule, 'Native animated module is not available')
    API.queueOperation(() => NativeAnimatedModule.dropAnimatedNode(tag))
  },
  addAnimatedEventToView: function addAnimatedEventToView(viewTag, eventName, eventMapping) {
    invariant(NativeAnimatedModule, 'Native animated module is not available')
    API.queueOperation(() =>
      NativeAnimatedModule.addAnimatedEventToView(viewTag, eventName, eventMapping)
    )
  },

  removeAnimatedEventFromView(viewTag, eventName, animatedNodeTag) {
    invariant(NativeAnimatedModule, 'Native animated module is not available')
    API.queueOperation(() =>
      NativeAnimatedModule.removeAnimatedEventFromView(viewTag, eventName, animatedNodeTag)
    )
  },
}
/**
 * Styles allowed by the native animated implementation.
 *
 * In general native animated implementation should support any numeric property that doesn't need
 * to be updated through the shadow view hierarchy (all non-layout properties).
 */

var SUPPORTED_STYLES = {
  opacity: true,
  transform: true,
  borderRadius: true,
  borderBottomEndRadius: true,
  borderBottomLeftRadius: true,
  borderBottomRightRadius: true,
  borderBottomStartRadius: true,
  borderTopEndRadius: true,
  borderTopLeftRadius: true,
  borderTopRightRadius: true,
  borderTopStartRadius: true,
  elevation: true,
  zIndex: true,

  /* ios styles */
  shadowOpacity: true,
  shadowRadius: true,

  /* legacy android transform properties */
  scaleX: true,
  scaleY: true,
  translateX: true,
  translateY: true,
}
var SUPPORTED_TRANSFORMS = {
  translateX: true,
  translateY: true,
  scale: true,
  scaleX: true,
  scaleY: true,
  rotate: true,
  rotateX: true,
  rotateY: true,
  rotateZ: true,
  perspective: true,
}
var SUPPORTED_INTERPOLATION_PARAMS = {
  inputRange: true,
  outputRange: true,
  extrapolate: true,
  extrapolateRight: true,
  extrapolateLeft: true,
}

function addWhitelistedStyleProp(prop) {
  SUPPORTED_STYLES[prop] = true
}

function addWhitelistedTransformProp(prop) {
  SUPPORTED_TRANSFORMS[prop] = true
}

function addWhitelistedInterpolationParam(param) {
  SUPPORTED_INTERPOLATION_PARAMS[param] = true
}

function validateTransform(configs) {
  configs.forEach((config) => {
    if (!SUPPORTED_TRANSFORMS.hasOwnProperty(config.property)) {
      throw new Error(
        "Property '" + config.property + "' is not supported by native animated module"
      )
    }
  })
}

function validateStyles(styles) {
  for (var _key in styles) {
    if (!SUPPORTED_STYLES.hasOwnProperty(_key)) {
      throw new Error("Style property '" + _key + "' is not supported by native animated module")
    }
  }
}

function validateInterpolation(config) {
  for (var _key2 in config) {
    if (!SUPPORTED_INTERPOLATION_PARAMS.hasOwnProperty(_key2)) {
      throw new Error(
        "Interpolation property '" + _key2 + "' is not supported by native animated module"
      )
    }
  }
}

function generateNewNodeTag() {
  return __nativeAnimatedNodeTagCount++
}

export function generateNewAnimationId() {
  return __nativeAnimationIdCount++
}

function assertNativeAnimatedModule() {
  invariant(NativeAnimatedModule, 'Native animated module is not available')
}

var _warnedMissingNativeAnimated = false
export function shouldUseNativeDriver(config) {
  if (config.useNativeDriver == null) {
    console.warn(
      'Animated: `useNativeDriver` was not specified. This is a required ' +
        'option and must be explicitly set to `true` or `false`'
    )
  }

  if (config.useNativeDriver === true && !NativeAnimatedModule) {
    if (!_warnedMissingNativeAnimated) {
      console.warn(
        'Animated: `useNativeDriver` is not supported because the native ' +
          'animated module is missing. Falling back to JS-based animation. To ' +
          'resolve this, add `RCTAnimation` module to this app, or remove ' +
          '`useNativeDriver`. ' +
          'Make sure to run `pod install` first. Read more about autolinking: https://github.com/react-native-community/cli/blob/master/docs/autolinking.md'
      )
      _warnedMissingNativeAnimated = true
    }

    return false
  }

  return config.useNativeDriver || false
}

function transformDataType(value) {
  // Change the string type to number type so we can reuse the same logic in
  // iOS and Android platform
  if (typeof value !== 'string') {
    return value
  }

  if (/deg$/.test(value)) {
    var degrees = parseFloat(value) || 0
    var radians = (degrees * Math.PI) / 180.0
    return radians
  } else {
    return value
  }
}

export default {
  API,
  addWhitelistedStyleProp,
  addWhitelistedTransformProp,
  addWhitelistedInterpolationParam,
  validateStyles,
  validateTransform,
  validateInterpolation,
  generateNewNodeTag,
  generateNewAnimationId,
  assertNativeAnimatedModule,
  shouldUseNativeDriver,
  transformDataType,

  // $FlowExpectedError - unsafe getter lint suppresion
  get nativeEventEmitter() {
    if (!nativeEventEmitter) {
      nativeEventEmitter = new NativeEventEmitter(NativeAnimatedModule)
    }

    return nativeEventEmitter
  },
}
