import { useRef, useState } from 'preact/hooks'
import styles from './Tabs.module.css'
import { useTabState } from './useTabState';

const tabSlotKey = 'tab.' as const;
const panelSlotKey = 'panel.' as const;

type TabSlot = `${typeof tabSlotKey}${string}`;
type PanelSlot = `${typeof panelSlotKey}${string}`;

function isTabSlotEntry(entry: [string, JSX.Element]): entry is [TabSlot, JSX.Element] {
	const [key] = entry;
	return key.startsWith(tabSlotKey);
}

function isPanelSlotEntry(entry: [string, JSX.Element]): entry is [PanelSlot, JSX.Element] {
	const [key] = entry;
	return key.startsWith(panelSlotKey);
}

function getBaseKeyFromTab(slot: TabSlot) {
	return slot.replace(new RegExp(`^${tabSlotKey}`), '')
}

function getBaseKeyFromPanel(slot: PanelSlot) {
	return slot.replace(new RegExp(`^${panelSlotKey}`), '')
}

type Props = {
	[key: TabSlot | PanelSlot]: JSX.Element;
	storeKey?: string;
}

export default function Tabs({ storeKey, ...slots }: Props) {
	const tabs = Object.entries(slots).filter(isTabSlotEntry)
	const panels = Object.entries(slots).filter(isPanelSlotEntry)
	/** Used to focus next and previous tab on arrow key press */
	const tabButtonRefs = useRef<Record<TabSlot, HTMLButtonElement | null>>({})

	const firstPanelKey = panels[0]?.[0] ?? ''
	const [curr, setCurr] = useTabState(getBaseKeyFromPanel(firstPanelKey), storeKey)

	function moveFocus(event: React.KeyboardEvent<HTMLDivElement>) {
		if (event.key === 'ArrowLeft') {
			const currIdx = tabs.findIndex(([key]) => getBaseKeyFromTab(key) === curr)
			if (currIdx > 0) {
				const [prevTabKey] = tabs[currIdx - 1]
				setCurr(getBaseKeyFromTab(prevTabKey))
				tabButtonRefs.current[prevTabKey]?.focus()
			}
		}
		if (event.key === 'ArrowRight') {
			const currIdx = tabs.findIndex(([key]) => getBaseKeyFromTab(key) === curr)
			if (currIdx < tabs.length - 1) {
				const [nextTabKey] = tabs[currIdx + 1]
				setCurr(getBaseKeyFromTab(nextTabKey))
				tabButtonRefs.current[nextTabKey]?.focus()
			}
		}
	}

	return (
		<div className={styles.container}>
			<div className={styles.tablist} role="tablist" onKeyDown={moveFocus}>
				{tabs.map(([key, content]) => (
					<button
						ref={el => tabButtonRefs.current[key] = el}
						onClick={() => setCurr(getBaseKeyFromTab(key))}
						aria-selected={curr === getBaseKeyFromTab(key)}
						tabIndex={curr === getBaseKeyFromTab(key) ? 0 : -1}
						role="tab"
						type="button"
						className={styles.tab}
						id={key}
						key={key}
					>
						{content}
					</button>
				))}
			</div>
			{panels.map(([key, content]) => (
				<div
					hidden={curr !== getBaseKeyFromPanel(key)}
					role="tabpanel"
					aria-labelledby={`${tabSlotKey}${getBaseKeyFromPanel(key)}`}
					className={styles.tabpanel}
					key={key}
				>
					{content}
				</div>
			))}
		</div>
	)
}
