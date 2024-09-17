import { Floater, Item, Position, Scope } from "./floater";
import { applyThemeColor, applyThemeOf } from "./theme";
import iro from '@jaames/iro';

const APPS = new Floater([
  new Item("Rapid7", [
    new Scope([
      new Item("Search", [], 'search'),
      new Item("Scan", [], 'radar'),
      new Item("Tags & Groups", [], 'label'),
      new Item("Users", [
        new Scope([
          new Item("Create", [], 'group_add'),
          new Item("Copy Permissions", [], "file_copy"),
          new Item("Add Permissions", [], 'playlist_add')
        ])
      ], 'person')
    ], "Production", 'verified'),
    new Scope([
      new Item("Search", [], 'search'),
      new Item("Tags & Groups", [], 'label'),
      new Item("Users", [
        new Scope([
          new Item("Create", [], 'group_add'),
          new Item("Copy Permissions", [], "file_copy"),
          new Item("Add Permissions", [], 'playlist_add')
        ])
      ], 'person')
    ], "M&A", 'experiment'),
    new Scope([
      new Item("Environment Check", [], 'problem'),
      new Item("Digital Workplace", [], 'browser_updated'),
      new Item("IPAM", [
        new Scope([
          new Item("Import", [], "download"),
          new Item("Fill Missing Details", [], 'edit'),
          new Item("Review", [], 'mystery'),
          new Item("Push to Rapid7", [], "cloud_upload"),
        ])
      ],
        "dns"
      ),
      new Item("Caches", []),
    ], "Routines", 'event'),
  ], 'pets')
],
  Position.BottomLeft
);



document.addEventListener('DOMContentLoaded', (_event) => {
  APPS.attach();
  let themes = Array.from(document.getElementsByClassName("themepick"));
  if (themes.length == 0) {
    return;
  }
  applyThemeOf(themes[0]);
  themes.forEach(
    (element) => {
      element.addEventListener("click", (event) => applyThemeOf(event.target), {
        passive: true,
      });
    }
  );
  var colorPicker = new iro.ColorPicker('#picker', {});
  colorPicker.on('color:change', (color) => applyThemeColor(color.hexString));
});
