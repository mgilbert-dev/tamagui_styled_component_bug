import { AnimationsDemo as AnimationsDemoBase } from '@tamagui/demos'
import dynamic from 'next/dynamic'

import { useTint } from './ColorToggleButton'

export { StacksDemo } from '@tamagui/demos'
export { ShapesDemo } from '@tamagui/demos'
export { TextDemo } from '@tamagui/demos'
export { ButtonDemo } from '@tamagui/demos'
export { ThemeInverseDemo } from '@tamagui/demos'
export { FormsDemo } from '@tamagui/demos'
export { LinearGradientDemo } from '@tamagui/demos'
export { HeadingsDemo } from '@tamagui/demos'
export { SeparatorDemo } from '@tamagui/demos'
export { ImageDemo } from '@tamagui/demos'
export { LabelDemo } from '@tamagui/demos'
export { GroupDemo } from '@tamagui/demos'
export { SelectDemo } from '@tamagui/demos'
export { CardDemo } from '@tamagui/demos'
export { AvatarDemo } from '@tamagui/demos'
export { ProgressDemo } from '@tamagui/demos'
export { ListItemDemo } from '@tamagui/demos'

export const DrawerDemo = dynamic(() => import('./DrawerDemo'))

export { TooltipDemo } from '@tamagui/demos'
export { PopoverDemo } from '@tamagui/demos'
export { DialogDemo } from '@tamagui/demos'
export { AnimationsHoverDemo } from '@tamagui/demos'
export { AnimationsEnterDemo } from '@tamagui/demos'
export { AnimationsPresenceDemo } from '@tamagui/demos'
export { SwitchDemo } from '@tamagui/demos'
export { SliderDemo } from '@tamagui/demos'
export { SpinnerDemo } from '@tamagui/demos'
export { FeatherIconsDemo } from '@tamagui/demos'

export const AnimationsDemo = (props) => {
  const { tint } = useTint()
  return <AnimationsDemoBase tint={tint} {...props} />
}
