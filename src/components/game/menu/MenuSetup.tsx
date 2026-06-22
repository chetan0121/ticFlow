import MenuDropdown from '../../ui/MenuOptions/MenuDropdown'
import RangeStepper from '../../ui/MenuOptions/RangeStepper'
import { useGameSetupOptions } from '../../../hooks/useGameSetupOptions'
import GameMenuGrid from './MenuSetupGrid'

function MenuSetupPanel() {
  const setupOptions = useGameSetupOptions()

  return (
    <GameMenuGrid>
      {setupOptions.map(option => {
        if ('selection' in option && option.selection.options.length >= 2) {
          return <MenuDropdown {...option} key={option.key} />
        } else if ('range' in option) {
          return <RangeStepper {...option} key={option.key} />
        }

        return null
      })}
    </GameMenuGrid>
  )
}

export default MenuSetupPanel
