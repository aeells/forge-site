function hookMobileMenu() {
  const controller = new AbortController()
  const signal = controller.signal
  const navbar = document.querySelector('#navbar')
  const container = document.querySelector('#mobile-menu')
  const openButton = document.querySelector('#open-menu')
  const closeButton = document.querySelector('#close-menu')
  const sections = container.querySelectorAll('.js-menu-section')

  function toggleSection(section) {
    sections.forEach(function (element) {
      const open = element.dataset.section === section
      element.classList.toggle('hidden', !open)
    })
  }

  function toggleMenu(force) {
    const open = force ?? container.classList.contains('hidden')
    if (open) toggleSection('root')
    container.classList.toggle('hidden', !open)
    openButton.classList.toggle('hidden', open)
    closeButton.classList.toggle('hidden', !open)
  }

  openButton.addEventListener('click', function() {
    toggleMenu()
  }, { signal })

  closeButton.addEventListener('click', function() {
    toggleMenu()
  }, { signal })

  document.addEventListener('click', function(event) {
    if (navbar.contains(event.target)) return
    toggleMenu(false)
  }, { signal })

  window.addEventListener('resize', function() {
    toggleMenu(false)
  }, { signal })

  container.querySelectorAll('button[data-section]').forEach(button => {
    button.addEventListener('click', () => {
      toggleSection(button.dataset.section)
    }, { signal })
  })

  return controller
}

function hookDesktopMenu() {
  const controller = new AbortController()
  const signal = controller.signal
  const navbar = document.querySelector('#navbar')
  const buttons = navbar.querySelectorAll('[aria-haspopup]')
  const menus = navbar.querySelectorAll('[role="menu"]')

  buttons.forEach(button => {
    button.addEventListener('keydown', (event) => {
      if (!['Enter', ' '].includes(event.key)) return
      event.preventDefault()
      const target = navbar.querySelector('#' + button.attributes['aria-controls'].value)
      target.classList.remove('hidden')
      target.querySelector('a')?.focus()
    }, { signal })
  })

  menus.forEach(menu => {
    menu.addEventListener('focusout', (event) => {
      const currentTarget = event.currentTarget
      requestAnimationFrame(() => {
        if (!currentTarget.contains(document.activeElement)) {
          menu.classList.add('hidden')
        }
      })
    }, { signal })

    menu.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return
      menu.classList.add('hidden')
    }, { signal })
  })

  return controller
}

function hookDesktopMenuHover() {
  if (!window.matchMedia('(hover: hover)').matches) return

  const controller = new AbortController()
  const signal = controller.signal
  const mousePosition = { x: 0, y: 0 }
  let checkInterval, maxTimeout

  document.addEventListener('mousemove', (e) => {
    mousePosition.x = e.pageX
    mousePosition.y = e.pageY
  }, { signal })

  const sign = (p1, p2, p3) => (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y)

  const inTriangle = (pt, v1, v2, v3) => {
    const d1 = sign(pt, v1, v2), d2 = sign(pt, v2, v3), d3 = sign(pt, v3, v1)
    return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0))
  }

  const inSafeZone = (trigger, dropdown) => {
    const triggerRect = trigger.getBoundingClientRect()
    const dropdownRect = dropdown.getBoundingClientRect()
    const scrollX = window.scrollX
    const scrollY = window.scrollY
    const mouse = mousePosition

    if (mouse.x >= triggerRect.left + scrollX && mouse.x <= triggerRect.right + scrollX &&
        mouse.y >= triggerRect.top + scrollY && mouse.y <= triggerRect.bottom + scrollY) return true
    if (mouse.x >= dropdownRect.left + scrollX && mouse.x <= dropdownRect.right + scrollX &&
        mouse.y >= dropdownRect.top + scrollY && mouse.y <= dropdownRect.bottom + scrollY) return true

    return inTriangle(mouse,
      { x: triggerRect.right + scrollX, y: triggerRect.top + scrollY },
      { x: dropdownRect.left + scrollX, y: dropdownRect.top + scrollY },
      { x: dropdownRect.right + scrollX, y: dropdownRect.top + scrollY }
    )
  }

  const close = (dropdown) => {
    dropdown?.classList.add('hidden')
    clearInterval(checkInterval)
    clearTimeout(maxTimeout)
  }

  const trigger = document.querySelector('[aria-controls="platform-menu"]')
  const dropdown = document.querySelector('#platform-menu')

  if (!trigger || !dropdown) return

  trigger.addEventListener('mouseenter', () => {
    dropdown.classList.remove('hidden')
    clearTimeout(maxTimeout)
    clearInterval(checkInterval)
    checkInterval = setInterval(() => !inSafeZone(trigger, dropdown) && close(dropdown), 50)
  }, { signal })

  trigger.addEventListener('mouseleave', () => {
    clearTimeout(maxTimeout)
    maxTimeout = setTimeout(() => close(dropdown), 300)
  }, { signal })

  dropdown.addEventListener('mouseenter', () => {
    clearInterval(checkInterval)
    clearTimeout(maxTimeout)
  }, { signal })

  dropdown.addEventListener('mouseleave', () => close(dropdown), { signal })

  return { controller, cleanup: () => { clearInterval(checkInterval); clearTimeout(maxTimeout) } }
}

let menuControllers = []

function unbindMenus() {
  menuControllers.forEach(item => {
    if (item?.controller) {
      item.controller.abort()
      item.cleanup?.()
    } else {
      item?.abort()
    }
  })
  menuControllers = []
}

function bindMenus() {
  unbindMenus()
  const mobileController = hookMobileMenu()
  const desktopController = hookDesktopMenu()
  const hoverResult = hookDesktopMenuHover()
  menuControllers = [mobileController, desktopController, hoverResult].filter(Boolean)
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bindMenus)
} else {
  bindMenus()
}

document.addEventListener('turbo:load', bindMenus)

document.addEventListener('turbo:before-visit', unbindMenus)
